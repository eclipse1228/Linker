const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const fsPromises = require("fs").promises;

const app = express();
const upload = multer({ dest: './content/' });
const openai = new OpenAI({ apiKey: '' }); // API 키 입력

app.use(express.static('upload')); // 정적 파일 제공
app.use(express.json());

// 파일 업로드 처리
app.post('/upload', upload.single('file'), async function(req, res) {
    try {
        // 파일 내용 읽기
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        var filename = req.file.originalname.replace(".txt",'');
        console.log("filename: "+ filename);
        console.log("readfile: process 1")
      
        // 쓰레드 생성 및 메시지 전송
        const thread = await openai.beta.threads.create();
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: 'O\n'+ fileContent,
        });
        console.log("readfile: process 2")
        // 런 생성 및 상태 확인
        const run = await openai.beta.threads.runs.create(
            thread.id,
            { 
              assistant_id: 'asst_0S7v0cy5jemRLaB3005BkZ1X',
            }
          );
        
        // 작업 상태 확인 코드 (Run이 끝났는지..그리고 끝날때 까지 대기)
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }
        console.log("readfile: filtering")
        // 메시지 필터링 및 출력
        const messages = await openai.beta.threads.messages.list(thread.id);
        const filteredMessages = messages.data
            .filter(message => message.run_id === run.id && message.role === "assistant" &&
                message.content && message.content[0].text && message.content[0].text.value.trim() !== '');

        filteredMessages.forEach(message => {
            console.log(message.content[0].text.value);
            console.log('문장의 끝');
        });
        
        
        var lines = filteredMessages[0].content[0].text.value.split("\n");
        var title;
        var filepath;
        
        
        if (!fs.existsSync(`.\\content\\${filename}`, 'utf8')) {
            fs.mkdirSync(`.\\content\\${filename}`);
            console.log("readfile: filegen")
        }
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('{')) {
                // 새 파일에 대한 제목과 경로 설정
                title = lines[i].replace(/[{}]/g, '');
                filepath = `.\\content\\${filename}\\${title}.md`;
        
                // 새 파일 생성 (이전 내용이 있으면 덮어쓰기)
                fs.writeFileSync(filepath, '', 'utf8');
                console.log(title + ' - file created');
            } else {
                // 파일에 내용 추가 (동기 방식)
                fs.appendFileSync(filepath, lines[i] + '\n', 'utf8');
                console.log('Description for ' + title + ': ' + lines[i]);
            }
        }
        console.log("readfile: file gen done")

        res.json({ message: "File processed successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing file');
    }
});

// 사용자 질문 입력 POST 매핑 
app.post('/sendToAssistant', async function(req, res)   {
    try {
        console.log(req.body);  // Log the entire body to debug
        
        const userInput = req.body.message;
        console.log("userInput:", userInput);
        // res.status(200).json({ assistantMessage: 'Response based on userInput' });

        // 쓰레드 생성 및 메시지 전송(쓰레드는 메세지 저장소)
        const thread = await openai.beta.threads.create();
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: userInput,
        });

        // 런 생성 및 상태 확인
        const run = await openai.beta.threads.runs.create(
            thread.id,
            {
              assistant_id: 'asst_0S7v0cy5jemRLaB3005BkZ1X',
            }
          );
        // 작업 상태 확인 코드 (Run이 끝났는지..그리고 끝날때 까지 대기)
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        // 메시지 필터링 및 출력
        const messages = await openai.beta.threads.messages.list(thread.id);
        const filteredMessages = messages.data
            .filter(message => message.run_id === run.id && message.role === "assistant" &&
                message.content && message.content[0].text && message.content[0].text.value.trim() !== '');

        // console 대신 웹에서 답변이 보여지게 바꿔야합니다. 
        filteredMessages.forEach(message => {
            console.log("message_gpt:",message.content[0].text.value);
        });

        const lastAssistantMessage = filteredMessages[filteredMessages.length - 1];
        res.json({ 
            userMessage: { role: 'user', content: userInput},
            assistantMessage: { role: 'assistant', content: lastAssistantMessage.content[0].text.value }
        })
    }
         catch (error) {
            console.error('Error in /sendToAssistant:', error);
            res.status(500).send('error sendToAs');
    }
});

// 루트 URL 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/upload/main.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const OpenAI = require('openai');
const fs = require("fs");
const fsPromises = require("fs").promises;
const openai = new OpenAI({apiKey:'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' });

async function main() {
  const assistantConfig = {
    name: "Obsidian Converter",
    instructions:
        "\"Obsidian Converter's role is to help users convert text and PDF files into enhanced learning formats that are compatible with Obsidian.\\nFocus on organizing your content using Markdown formatting, including headings, bullets, and other formatting elements.\\nWhen identifying and linking 'keywords', include the most important content within your PDF in [['Keyword']] format. Also, group keywords only once in your notes to avoid cluttering your content. The 'Vault' file I delivered is an Obsidian file in the format I want. Please refer to the document and organize it in the same format.\\nTo explain further, MOCS, a subfolder of the Vault file, is a folder that organizes the learned content. The substructure of a MOCS file is as follows:\\n1. Archive folder: Study notes are saved.\\n2. Storage folder: Photos related to learning are saved.\\n\\nThe converted content is delivered to the user as a compressed file, which can be opened in Obsidian and studied through the knowledge graph in the graph view.\",",
    tools: [{ type: "retrieval" }], // configure the retrieval tool to retrieve files in the future
    model: "gpt-4-1106-preview",
};
  const assistantFilePath = "./assistant.json";
  // const assistant = await openai.beta.assistants.create(assistantConfig);
  // assistantDetails = { assistantId: assistant.id, ...assistantConfig };
  // assistantId = assistantDetails.assistantId;  

  // Save the assistant details to assistant.json
  // await fsPromises.writeFile(
  //   assistantFilePath,
  //   JSON.stringify(assistantDetails, null, 2)
  // );

  // assistantId = assistantDetails.assistantId;
  
  
  const thread = await openai.beta.threads.create();

  const threadMessages = await openai.beta.threads.messages.create(
    thread.id,
    { role: "user", content: "what can you help me? please Answer me to text" }
  );

  // console.log(threadMessages);
  

  const run = await openai.beta.threads.runs.create(
    thread.id,
    { 
      assistant_id: 'asst_0S7v0cy5jemRLaB3005BkZ1X',
      instructions: "Obsidian Converter's role is to help users convert text and PDF files into enhanced learning formats that are compatible with Obsidian.\nFocus on organizing your content using Markdown formatting, including headings, bullets, and other formatting elements.\nWhen identifying and linking 'keywords', include the most important content within your PDF in [['Keyword']] format. Also, group keywords only once in your notes to avoid cluttering your content. The 'Vault' file I delivered is an Obsidian file in the format I want. Please refer to the document and organize it in the same format.\nTo explain further, MOCS, a subfolder of the Vault file, is a folder that organizes the learned content. The substructure of a MOCS file is as follows:\n1. Archive folder: Study notes are saved.\n2. Storage folder: Photos related to learning are saved.\n\nThe converted content is delivered to the user as a compressed file, which can be opened in Obsidian and studied through the knowledge graph in the graph view."    }
  );

  let runStatus = await openai.beta.threads.runs.retrieve(
    thread.id,
    run.id
);

  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
    );

    // Check for failed, cancelled, or expired status
    if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        console.log(
            `Run status is '${runStatus.status}'. Unable to complete the request.`
        );
        break; // Exit the loop if the status indicates a failure or cancellation
    }
    
    const messages = await openai.beta.threads.messages.list(thread.id);

const filteredMessages = messages.data
    .filter(
        (message) =>
            message.run_id === run.id && 
            message.role === "assistant" &&
            message.content &&
            message.content[0].text &&
            message.content[0].text.value.trim() !== '' // 이 부분이 비어있지 않은 메시지만 필터링합니다.
    );

// 출력 부분
filteredMessages.forEach(message => {
    console.log(message.content[0].text.value);
});}}

main();
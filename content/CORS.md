## CORS는 무엇인가요?

브라우저에서는 보안적인 이유로 `cross-origin` HTTP 요청들을 제한합니다. 그래서 `cross-origin` 요청을 하려면 서버의 동의가 필요합니다. 만약 서버가 동의한다면 브라우저에서는 요청을 허락하고, 동의하지 않는다면 브라우저에서 거절합니다.

이러한 허락을 구하고 거절하는 메커니즘을 HTTP-header를 이용해서 가능한데, 이를 CORS(Cross-Origin Resource Sharing)라고 부릅니다.

그래서 브라우저에서 `cross-origin` 요청을 안전하게 할 수 있도록 하는 메커니즘입니다.

### cross-origin

`cross-origin`이란 다음 중 한 가지라도 다른 경우를 말합니다.

1. 프로토콜 - http와 https는 프로토콜이 다르다.
2. 도메인 - domain.com과 other-domain.com은 다르다.
3. 포트 번호 - 8080포트와 3000포트는 다르다.

## CORS는 왜 필요한가요?

CORS가 없이 모든 곳에서 데이터를 요청할 수 있게 되면, 다른 사이트에서 원래 사이트를 흉내낼 수 있게 됩니다. 예를 들어서 기존 사이트와 완전히 동일하게 동작하도록 하여 사용자가 로그인을 하도록 만들고, 로그인했던 세션을 탈취하여 악의적으로 정보를 추출하거나 다른 사람의 정보를 입력하는 등 공격을 할 수 있습니다. 이렇나 공격을 할 수 없도록 브라우저에서 보호하고, 필요한 경우 에만 서버와 협의하여 요청할 수 있도록 하기 위해서 필요합니다.

## CORS는 어떻게 동작하나요?

### Simple requests인 경우

1. 서버로 요청을 합니다.
2. 서버의 응답이 왔을 때 브라우저가 요청한 `Origin`과 응답한 헤더 `Access-Control-Request-Headers`의 값을 비교하여 유효한 요청이라면 리소스를 응답합니다. 만약 유효하지 않은 요청이라면 브라우저에서 이를 막고 에러가 발생합니다.

#### Simple requests란?

HTTP method가 다음 중 하나이면서

- GET
- HEAD
- POST

자동으로 설정되는 헤더는 제외하고, 설정할 수 있는 다음 헤더들만 변경하면서

- Accept
- Accept-Language
- Content-Language

`Content-Type`이 다음과 같은 경우

- application/x-www-form-urlencoded
- multipart/form-data
- text/plain

Simple requqets라고 부릅니다. 이 요청은 추가적으로 확인하지 않고 바로 본 요청을 보냅니다.

### preflight 요청일 경우

1. `Origin`헤더에 현재 요청하는 origin과, `Access-Control-Request-Method`헤더에 요청하는 HTTP method와 `Access-Control-Request-Headers`요청 시 사용할 헤더를 `OPTIONS` 메서드로 서버로 요청합니다. 이때 내용물은 없이 헤더만 전송합니다.
2. 브라우저가 서버에서 응답한 헤더를 보고 유효한 요청인지 확인합니다. 만약 유효하지 않은 요청이라면 요청은 중단되고 에러가 발생합니다. 만약 유효한 요청이라면 원래 요청으로 보내려던 요청을 다시 요청하여 리소스를 응답받습니다.

#### preflight 요청이란?

Simple requests가 아닌 `cross-origin`요청은 모두 preflight 요청을 하게 되는데, 실제 요청을 보내는 것이 안전한지 확인하기 위해 먼저 OPTIONS 메서드를 사용하여 `cross-origin` HTTP 요청을 보냅니다. 이렇게 하는 이유는 사용자 데이터에 영향을 미칠 수 있는 요청이므로 사전에 확인 후 본 요청을 보냅니다.

## 요청 헤더 목록

- Origin
- Access-Control-Request-Method
    - `preflight` 요청을 할 때 실제 요청에서 어떤 메서드를 사용할 것인지 서버에게 알리기 위해 사용됩니다.
- Access-Control-Request-Headers
    - `preflight`요청을 할 때 실제 요청에서 어떤 header를 사용할 것인지 서버에게 알리기 위해 사용됩니다.

## 응답 헤더 목록

- Access-Control-Allow-Origin
    - 브라우저가 해당 origin이 자원에 접근할 수 있도록 허용합니다. 혹은 `*`은 credentials이 없는 요청에 한해서 모든 origin에서 접근이 가능하도록 허용합니다.
- Access-Control-Expose-Headers
    - 브라우저가 액세스할 수 있는 서버 화이트리스트 헤더를 허용합니다.
- Access-Control-Max-Age
    - 얼마나 오랫동안 `preflight`요청이 캐싱 될 수 있는지를 나타낸다.
- Access-Control-Allow-Credentials
    - `Credentials`가 true 일 때 요청에 대한 응답이 노출될 수 있는지를 나타냅니다.
    - `preflight`요청에 대한 응답의 일부로 사용되는 경우 실제 자격 증명을 사용하여 실제 요청을 수행할 수 있는지를 나타냅니다.
    - 간단한 GET 요청은 `preflight`되지 않으므로 자격 증명이 있는 리소스를 요청하면 헤더가 리소스와 함께 반환되지 않으면 브라우저에서 응답을 무시하고 웹 콘텐츠로 반환하지 않습니다.
- Access-Control-Allow-Methods
    - preflight`요청에 대한 대한 응답으로 허용되는 메서드들을 나타냅니다.
- Access-Control-Allow-Headers
    - `preflight`요청에 대한 대한 응답으로 실제 요청 시 사용할 수 있는 HTTP 헤더를 나타냅니다.
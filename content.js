let timeoutId=null;
let max_tries=20;
let lasturl=location.pathname;

chrome.storage.local.set({ geminiApiKey: "YOUR_API_KEY"}, () => {
    console.log("Gemini API key saved!");
});

const observer=new MutationObserver(()=>{
        const currenturl=location.pathname;
        if(currenturl!=lasturl){
            lasturl=currenturl;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
            pagechange();
            }, 500); 
        }
});
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
        pagechange();
});
pagechange();

function onProblemsPage(){
    const pathname=window.location.pathname;
    return pathname.startsWith('/problems/') && pathname.length > ('/problems/').length;
}

function getCurrentprobid(){
    const probid=window.location.pathname.match(/(\d+)$/);
    return probid ? probid[1]:null;
}
function getLocalStoragevaluebyid(id){
    let userid=null;
    let language=null;
    for(let i=0;i<localStorage.length;i++)
    {
        const k=localStorage.key(i);
        const parts=k.split('_');
        if(parts.length===4 && parts[0]==='course' && parts[2]===id.toString()){
            userid=parts[1];
            language=parts[3];
            break;
        }
    }
    console.log(`${userid},${language}`);
    if(userid && language){
        const key=`course_${userid}_${id}_${language}`;
        const value=localStorage.getItem(key);
        if(value !==null)
        {
            console.log(`value for the key ${key}`,value);
            return {code:value,language};
        }
        else{
            console.log(`key ${key} is not found in LocalStorage`);
        }
    }
    return null;
    
}

function getLocalStoragevaluetheme(){
    const key=`playlist-page-theme`;
    let value=localStorage.getItem(key);
    try{
        value=JSON.parse(value);
    }catch(e){
        console.warn("Theme parse error: ",e);
    }
    if(value !==null)
    {
        console.log(`Theme:`,value);
    }
    else{
        console.log(`key ${key} is not found in LocalStorage`);
    }
    return value;
}

function clearthepage(){
        const existingbutton=document.getElementById("button-id");
        if(existingbutton){
            existingbutton.remove();
        }
        const existingcontainer=document.getElementById("container-id");
        if(existingcontainer){
            existingcontainer.remove();
        }
        console.log("page cleared");
}

function pagechange(){
    clearthepage();
    if (observer) observer.disconnect();
    setTimeout(() => {
        addbotbutton();
        if (observer) observer.observe(document.body, { childList: true, subtree: true });
    }, 500);
}

let lastTheme = getLocalStoragevaluetheme();

const checkAndBindThemeToggle = () => {
  const switchBtn = document.querySelector(".ant-switch");
  if (switchBtn && !switchBtn.dataset.bound) {
    switchBtn.dataset.bound = "true";
    switchBtn.addEventListener("click", () => {
      setTimeout(() => {
        const newTheme = getLocalStoragevaluetheme();
        if (newTheme !== lastTheme) {
          lastTheme = newTheme;
          pagechange();
        }
      }, 200);
    });
  }
};

new MutationObserver(checkAndBindThemeToggle).observe(document.body, {
  childList: true,
  subtree: true,
});

checkAndBindThemeToggle();


function opencontainer(){
    observer.disconnect();
    if(document.getElementById("container-id")) return;
    const containerkey = "containerOpen_" + location.pathname.split("/")[2];
    chrome.runtime.sendMessage({
    type: "SET_CONTAINER_OPEN",
    key: containerkey
    });

    const box=document.createElement("div");
    box.id="container-id";
    box.style.height="420px";
    box.style.width="680px";
    box.style.borderRadius="15px";
    box.style.border="2px solid black";
    box.style.borderColor="black";
    const themecolor=getLocalStoragevaluetheme();
    if(themecolor==="light") box.style.backgroundColor="#e3f2fd";
    else box.style.backgroundColor="#2b384e";
    box.style.display="flex";
    box.style.flexDirection="column";
    box.style.justifyContent = "space-between"; 
    box.style.position = "relative";
    box.style.flex="0 0 auto";
    box.style.zIndex = "auto";
    
    const botbutton=document.getElementById("button-id");
    if(botbutton){
        botbutton.insertAdjacentElement("afterend",box);
    }

    const heading=document.createElement("p");
    heading.innerText="AI Helper";
    heading.style.fontSize="16px";
    heading.style.fontWeight="bold";
    heading.style.fontFamily="Times New Roman";
    if(themecolor==="light") heading.style.backgroundColor="#023e8a";
    else heading.style.backgroundColor="#161d29";
    heading.style.borderTopLeftRadius="15px";
    heading.style.borderTopRightRadius="15px";
    heading.style.color="white";
    heading.style.padding="13px";
    box.appendChild(heading);

    const closeButton=document.createElement("button");
    closeButton.style.width="30px";
    closeButton.style.height="30px";
    closeButton.style.cursor="pointer";
    closeButton.style.position = "absolute";
    closeButton.style.right="5px";
    closeButton.style.top="5px";
    closeButton.style.backgroundImage='url("https://cdn-icons-png.flaticon.com/512/1214/1214428.png")';
    closeButton.style.backgroundSize="contain";
    closeButton.style.backgroundRepeat = "no-repeat";
    closeButton.style.backgroundPosition="center";
    closeButton.style.backgroundColor="white";
    closeButton.style.padding="10px 16px";
    closeButton.style.transition="background-color 0.2s ease-in-out";
    box.appendChild(closeButton);

    const chatarea=document.createElement("div");
    chatarea.id="chatarea-id";
    chatarea.style.overflowY="auto";
    chatarea.style.fontFamily="Times New Roman";
    chatarea.style.flex="1";
    chatarea.style.display="flex";
    chatarea.style.flexDirection="column";
    chatarea.style.gap="10px";
    chatarea.style.justifyContent="flex-start";
    if(themecolor==="light") chatarea.style.backgroundColor="#e3f2fd";
    else chatarea.style.backgroundColor="#2b384e";
    box.appendChild(chatarea);

    const inputbar=document.createElement("div");
    inputbar.style.display="flex";
    inputbar.style.border="none";
    inputbar.style.height="63px";
    inputbar.style.marginBottom="0px";
    if(themecolor==="light") inputbar.style.backgroundColor="#e8dab2";
    else inputbar.style.backgroundColor="#778da9";
    inputbar.style.borderBottomLeftRadius="15px";
    inputbar.style.borderBottomRightRadius="15px";

    const inputtext=document.createElement("textarea");
    inputtext.placeholder="Type your message...";
    inputtext.style.width="500px";
    inputtext.style.height="42px";
    inputtext.style.border="none";
    inputtext.style.marginTop="7px";
    inputtext.style.overflowY="auto";
    inputtext.style.resize="none";
    inputtext.style.fontSize="18px";
    inputtext.style.marginRight="20px";
    inputtext.style.fontFamily="Times New Roman";
    inputtext.style.backgroundColor="white";
    inputtext.style.outline="none";
    inputtext.style.flex="1";
    inputtext.style.borderRadius="5px";
    inputtext.style.marginLeft="4px";

    const sendbutton=document.createElement("button");
    sendbutton.style.backgroundImage='url("https://cdn-icons-png.flaticon.com/512/736/736110.png")';
    sendbutton.style.cursor="pointer";
    sendbutton.style.backgroundSize="cover";
    sendbutton.style.padding="10px";
    sendbutton.style.width="40px";
    sendbutton.style.marginRight="3px";
    sendbutton.style.borderRadius="20px";
    sendbutton.style.border="none";
    sendbutton.style.marginTop="8px";
    sendbutton.style.transform="rotate(330deg)";
    sendbutton.style.height="40px";
    sendbutton.style.backgroundColor="white";

    inputbar.appendChild(inputtext);
    inputbar.appendChild(sendbutton);
    box.appendChild(inputbar);

    sendbutton.onclick=()=>{
        const message=inputtext.value.trim();
        if(!message) return;
        inputtext.value="";

        const keyOfPage="chats_"+location.pathname.split("/")[2];

        const messageElement=document.createElement("div");
        messageElement.innerText=message;
        messageElement.style.padding="7px";
        messageElement.style.fontSize="15px";
        if(themecolor==="light") messageElement.style.backgroundColor="#023e8a";
        else messageElement.style.backgroundColor="#778da9";
        messageElement.style.borderRadius="5px";
        messageElement.style.color="white";
        messageElement.style.marginRight="120px";
        messageElement.style.marginLeft="4px";
        chatarea.appendChild(messageElement);

        chatarea.scrollTop=chatarea.scrollHeight;

        chrome.storage.local.get([keyOfPage],(result)=>{
        const messages=result[keyOfPage]|| [];
        messages.push({role:"you",text:message});
        chrome.storage.local.set({[keyOfPage]:messages});
        });
        
        const aiBubble = document.createElement("div");
        aiBubble.innerText = "Thinking...";
        aiBubble.style.padding = "7px";
        aiBubble.style.fontSize = "15px";
        if(themecolor==="light") aiBubble.style.backgroundColor="#48cae4";
        else aiBubble.style.backgroundColor="#48cae4";
        aiBubble.style.borderRadius = "5px";
        aiBubble.style.color = "black";
        aiBubble.style.marginRight = "120px";
        aiBubble.style.marginLeft = "4px";
        chatarea.appendChild(aiBubble);
        chatarea.scrollTop = chatarea.scrollHeight;

        chrome.runtime.sendMessage({ action: "getApiKey" }, function (response) {
        if (!response || !response.apiKey) {
            aiBubble.innerText = "No API key set!";
            return;
        }

        const probstatement=document.querySelector(".py-4.px-3.coding_desc_container__gdB9M");
        const problemtext=probstatement?probstatement.innerText:'';
        const id=getCurrentprobid();
        let results=getLocalStoragevaluebyid(id);
        let fullprompt="";
        if(results){
            let lang=results.language;
            let code=results.code;
            fullprompt=`Problem:${problemtext}\nUser query:${message}\nHere is my code ${code}\n Language ${lang}`;
        }
        else{
            fullprompt=`Problem:${problemtext}\nUser query:${message}`;
        }
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${response.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: fullprompt }]
                    }
                ]
            })
        })
        .then(res => res.json())
        .then(data => {
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response!";
            aiBubble.innerText=reply;

            chrome.storage.local.get([keyOfPage], (result) => {
                const messages = result[keyOfPage] || [];
                messages.push({ role: "ai", text: reply });
                chrome.storage.local.set({ [keyOfPage]: messages });
            });
        })
        .catch(error => {
            aiBubble.innerText = "Error fetching response!";
            console.error("Fetch error:", error);
        });
    });
    };

    const keyOfPage="chats_"+location.pathname.split("/")[2];

    chrome.storage.local.get([keyOfPage],(result)=>{
        const history=result[keyOfPage] || [];
        for(const message of history){
            const messageElement=document.createElement("div");
            messageElement.innerText=message.text;
            messageElement.style.padding="7px";
            messageElement.style.fontSize="15px";
            messageElement.style.borderRadius="5px";
            messageElement.style.marginRight="120px";
            messageElement.style.marginLeft="4px";
            if(message.role==="you"){
                if(themecolor==="light") messageElement.style.backgroundColor="#023e8a";
                else messageElement.style.backgroundColor="#778da9";
                messageElement.style.color="white";
            }
            else{
                if(themecolor==="light") {
                    messageElement.style.backgroundColor="#48cae4";
                    messageElement.style.color="white";
                }
                else 
                {
                    messageElement.style.backgroundColor="#48cae4";
                    messageElement.style.color="black";
                }
            }
            chatarea.appendChild(messageElement);
        }
        chatarea.scrollTop=chatarea.scrollHeight;
    });

    closeButton.onclick=()=>{
        chrome.storage.local.set({[containerkey]:false});
        const keyOfPage="chats_"+location.pathname.split("/")[2];
        chrome.storage.local.remove(keyOfPage);
        box.remove();
    };

    observer.observe(document.body, { childList: true, subtree: true });
}
function addbotbutton(){
    if(!onProblemsPage())return;
    if(document.getElementById("button-id")) return;

    const description=document.querySelector(".fw-bolder.problem_heading");
    const positionparent=document.querySelector(".py-4.px-3.coding_desc_container__gdB9M");
    if(positionparent && description.innerText.trim()!=="")
    {
        const botbutton=document.createElement("button");
        botbutton.style.all = "unset";
        botbutton.style.zIndex = "auto";
        botbutton.id="button-id";
        botbutton.style.display="none";
        botbutton.innerText="CODEMATE";
        botbutton.style.padding="10px";
        botbutton.style.borderRadius="6px";
        botbutton.style.fontWeight="bold";
        botbutton.style.fontSize="18px";
        const themecolor=getLocalStoragevaluetheme();
        if(themecolor==="light") botbutton.style.backgroundColor="#023e8a";
        else botbutton.style.backgroundColor="#161d29";
        botbutton.style.color="white";
        botbutton.style.fontFamily='Times New Roman';
        botbutton.style.cursor="pointer";
        botbutton.style.display="flex";
        botbutton.style.textAlign="center";
        botbutton.style.border="none";
        botbutton.style.position = "relative";
        botbutton.style.transform = "translateZ(0)";
        
        positionparent.insertAdjacentElement("beforeend",botbutton);
        botbutton.style.display="inline-block";
        botbutton.addEventListener("click",opencontainer);
        const containerkey="containerOpen_"+location.pathname.split("/")[2];
        chrome.storage.local.get([containerkey],function(result){
            if(!onProblemsPage()){
                console.log("Page changed during load. Skipping container open.");
                return;
            }
            if(result[containerkey]=== true)
            {
                opencontainer();
            }
        });
    }
    else if(max_tries>0){
        max_tries--;
        setTimeout(addbotbutton,200);
    }
}

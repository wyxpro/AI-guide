const fs = require('fs');
const filePath = 'e:\\Code\\AI\\Start\\Web\\AI-guide\\src\\components\\screens\\RoutesScreen.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const old =               {chatMessages.map((msg, idx) => (                <div key={idx} className={\lex \\}>                  <div className={\max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm \\}>                    {msg.content}                  </div>                </div>              ))};
const avatar1 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80';
const avatar2 = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80';
const new =               {chatMessages.map((msg, idx) => {                const isUser = msg.role === " user\; const avatarSrc = isUser ? (user?.avatar || '') : ''; return ( <div key={idx} className={\lex gap-2.5 \\}> <div className=\flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-zinc-200 bg-white\> <img src={avatarSrc} alt={isUser ? \我\ : \小慧\} className=\w-full h-full object-cover\ /> </div> <div className={\max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm \\}> {msg.content} </div> </div> ); })};
if (content.includes(old)) { content = content.replace(old, new); fs.writeFileSync(filePath, content, 'utf8'); console.log('Replaced mobile chat messages');} else { console.log('Pattern not found');}

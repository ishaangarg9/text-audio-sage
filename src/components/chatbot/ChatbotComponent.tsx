import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ChevronRight, Info, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const ChatbotComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/chat', {
        message: input
      });
      const botMessage: Message = { type: 'bot', content: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        type: 'bot',
        content: 'Oops! Something went wrong. Please try again.'
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error from backend:', error);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // return (
  //   <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
  //     <h2>Chatbot</h2>
  //     <div style={{ border: '1px solid #ccc', padding: 10, height: 400, overflowY: 'auto' }}>
  //       {messages.map((msg, idx) => (
  //         <div key={idx} style={{ textAlign: msg.type === 'user' ? 'right' : 'left' }}>
  //           <p><strong>{msg.type === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}</p>
  //         </div>
  //       ))}
  //       {loading && <p><em>Bot is typing...</em></p>}
  //     </div>
  //     <input
  //       type="text"
  //       value={input}
  //       onChange={(e) => setInput(e.target.value)}
  //       onKeyDown={handleKeyPress}
  //       placeholder="Type a message"
  //       style={{ width: '80%', marginTop: 10 }}
  //     />
  //     <button onClick={sendMessage} disabled={loading} style={{ width: '18%', marginLeft: '2%' }}>
  //       Send
  //     </button>
  //   </div>
  // );

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Speech Therapy Assistant</CardTitle>
          <CardDescription>
            Ask questions about stuttering or speech therapy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[70vh]">
            <ScrollArea className="flex-1 p-4 border rounded-md mb-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 max-w-[80%]",
                      message.type === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 bg-muted flex items-center justify-center border">
                      {message.type === "user" ? (
                        <span className="text-xs font-medium text-blue-700">You</span>
                      ) : (
                        <MessageCircle className="h-4 w-4 text-teal-700" />
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "p-3 rounded-lg whitespace-pre-wrap text-sm",
                        message.type === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-muted rounded-tl-none border"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 bg-muted flex items-center justify-center border">
                      <MessageCircle className="h-4 w-4 text-teal-700" />
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted rounded-tl-none border">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
  
            <div className="mt-2 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
};

export default ChatbotComponent;

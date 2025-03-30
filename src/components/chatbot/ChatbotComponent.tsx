
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

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const presetQuestions = [
  "What are the different types of stuttering?",
  "How can I help someone who stutters?",
  "What causes stuttering?",
  "Are there exercises to reduce stuttering?",
  "Is stuttering treatable?",
];

const ChatbotComponent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your speech therapy assistant. Ask me anything about stuttering, speech patterns, or how to use this application.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string = input) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a real app, this would call an LLM API
      setTimeout(() => {
        const responses: Record<string, string> = {
          "What are the different types of stuttering?": 
            "There are generally 5 main types of stuttering patterns:\n\n" +
            "1. **Blocks**: When speech suddenly stops, often with tension.\n" +
            "2. **Prolongations**: Extending sounds longer than normal (e.g., 'sssssoon').\n" +
            "3. **Repetitions**: Repeating sounds, syllables or words (e.g., 'b-b-book').\n" +
            "4. **Interjections**: Adding filler words or sounds (e.g., 'um', 'uh').\n" +
            "5. **Revisions**: Changing phrases midway (e.g., 'I want- I need').\n\n" +
            "Our audio analysis tool can identify all these patterns in speech recordings.",
          
          "How can I help someone who stutters?": 
            "To support someone who stutters:\n\n" +
            "• Maintain natural eye contact and be patient\n" +
            "• Don't finish their sentences or words\n" +
            "• Focus on listening to their message, not their stutter\n" +
            "• Speak at a relaxed, slightly slower pace yourself\n" +
            "• Avoid saying 'slow down' or 'relax'\n" +
            "• Ask how they prefer to be supported\n\n" +
            "The most important thing is to show respect and give them time to express themselves.",
          
          "What causes stuttering?": 
            "Stuttering typically has multiple contributing factors:\n\n" +
            "**Neurological factors**: Differences in how the brain processes speech\n" +
            "**Genetic factors**: About 60% of people who stutter have a family history\n" +
            "**Developmental factors**: Often begins during childhood speech development\n" +
            "**Environmental triggers**: Stress, anxiety, or exciting events can increase stuttering\n\n" +
            "For most people, stuttering begins in childhood (developmental stuttering), while acquired stuttering can occur after neurological injury or trauma.",
          
          "Are there exercises to reduce stuttering?": 
            "Yes, several techniques can help reduce stuttering:\n\n" +
            "1. **Slow, rhythmic speech**: Speaking at a controlled, measured pace\n" +
            "2. **Gentle onsets**: Starting speech with relaxed articulators\n" +
            "3. **Diaphragmatic breathing**: Proper breathing technique before speaking\n" +
            "4. **Prolonged speech**: Slightly extending vowel sounds\n" +
            "5. **Pausing**: Strategically using pauses between phrases\n\n" +
            "Speech therapy with a licensed Speech-Language Pathologist is the most effective way to learn these techniques personalized to your specific patterns.",
          
          "Is stuttering treatable?": 
            "Stuttering is treatable, though approaches vary depending on age and individual factors:\n\n" +
            "• For young children, early intervention can sometimes lead to complete recovery\n" +
            "• For older children and adults, speech therapy focuses on managing stuttering and reducing its impact\n" +
            "• Many people achieve significant improvement with proper treatment\n\n" +
            "Treatment typically involves learning techniques to speak more fluently, reducing anxiety about speaking, and building confidence. While there's no universal 'cure', many people achieve very functional, comfortable speech with effective therapy.",
        };

        // Generate response based on preset questions or default response
        let responseContent = "";
        
        for (const question of presetQuestions) {
          if (content.toLowerCase().includes(question.toLowerCase().replace(/\?$/, ""))) {
            responseContent = responses[question];
            break;
          }
        }
        
        // Default response if no match found
        if (!responseContent) {
          responseContent = "Thank you for your question about " + content.split(" ").slice(0, 3).join(" ") + "... " + 
            "This is a simulated response. In a full implementation, this would connect to an LLM with comprehensive knowledge about speech therapy, stuttering patterns, and related topics. " +
            "The chatbot would use RAG (Retrieval Augmented Generation) to provide accurate, helpful answers from verified sources.";
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your speech therapy assistant. Ask me anything about stuttering, speech patterns, or how to use this application.",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Chat cleared",
      description: "Started a new conversation",
    });
  };

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Speech Therapy Assistant</CardTitle>
          <CardDescription>
            Ask questions about stuttering, speech therapy, or how to use this app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="info">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="flex flex-col h-[60vh] md:h-[70vh]">
                <div className="p-4 mb-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p>This chatbot uses retrieval-augmented generation (RAG) to provide accurate information about speech therapy.</p>
                  </div>
                </div>
                
                <div className="mb-4 flex flex-wrap gap-2">
                  {presetQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleSendMessage(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
                
                <ScrollArea className="flex-1 p-4 border rounded-md">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3 max-w-[80%] mb-4",
                          message.sender === "user" ? "ml-auto" : ""
                        )}
                      >
                        {message.sender === "assistant" && (
                          <Avatar className="h-8 w-8 bg-teal-100 border border-teal-200 flex items-center justify-center">
                            <MessageCircle className="h-4 w-4 text-teal-700" />
                          </Avatar>
                        )}
                        
                        <div
                          className={cn(
                            "p-3 rounded-lg whitespace-pre-wrap",
                            message.sender === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-muted rounded-tl-none border"
                          )}
                        >
                          {message.content}
                        </div>
                        
                        {message.sender === "user" && (
                          <Avatar className="h-8 w-8 bg-blue-100 border border-blue-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">You</span>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-teal-100 border border-teal-200 flex items-center justify-center">
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
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="mt-4 flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <span className="sr-only">Send</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearChat}
                    disabled={isLoading}
                    title="Clear conversation"
                  >
                    <span className="sr-only">Clear chat</span>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="space-y-6 p-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">About the Chatbot</h3>
                  <p className="text-muted-foreground">
                    This chatbot uses retrieval-augmented generation (RAG) to provide accurate information about stuttering, 
                    speech therapy, and related topics. It combines the power of large language models with a specialized 
                    knowledge base focused on speech and language disorders.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">What is Retrieval-Augmented Generation (RAG)?</h3>
                  <p className="text-muted-foreground">
                    RAG is a technique that combines the strengths of retrieval-based and generation-based approaches to 
                    AI assistance. This means the chatbot retrieves relevant information from trusted resources 
                    about speech therapy and stuttering before generating responses, ensuring more accurate and helpful answers.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Sources</h3>
                  <p className="text-muted-foreground">
                    The knowledge base includes information from speech-language pathology research, clinical guidelines,
                    and educational resources. All information is vetted for accuracy and based on established practices
                    in speech therapy.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Limitations</h3>
                  <p className="text-muted-foreground">
                    While our chatbot provides valuable information, it is not a substitute for professional medical advice,
                    diagnosis, or treatment. Always consult with a qualified speech-language pathologist for personalized
                    assessment and therapy.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotComponent;

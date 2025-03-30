
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, FileText, Wand2 } from "lucide-react";

const TextEditorComponent = () => {
  const [text, setText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const enhanceText = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to enhance.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI enhancement (in a real app, this would call an API)
    try {
      // This is a placeholder - in a real app, you would call an API here
      setTimeout(() => {
        const improved = text
          .replace(/(?:^|\. )(.)/g, (match) => match.toUpperCase()) // Capitalize sentences
          .replace(/\bi\b/g, "I") // Capitalize "i"
          .replace(/\s{2,}/g, " ") // Remove extra spaces
          .replace(/\b(?:dont|cant|wont|didnt|couldnt|shouldnt|wouldnt)\b/g, (match) => 
            match.replace(/t\b/, "'t")); // Add apostrophes
        
        setEnhancedText(improved);
        setIsLoading(false);
        
        toast({
          title: "Text enhanced",
          description: "Your text has been improved!",
        });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to enhance text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (contentToCopy: string) => {
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadText = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">AI-Powered Text Editor</CardTitle>
          <CardDescription>
            Enter your text below and let our AI improve your writing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="enhanced" disabled={!enhancedText}>
                Enhanced
              </TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="min-h-[300px] p-4"
              />
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={enhanceText} 
                  disabled={isLoading || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Enhance Text
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(text)}
                  disabled={!text.trim()}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadText(text, "my-text.txt")}
                  disabled={!text.trim()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setText("")}
                  disabled={!text.trim()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="enhanced" className="space-y-4">
              <div className="min-h-[300px] border rounded-md p-4 whitespace-pre-wrap">
                {enhancedText}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(enhancedText)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadText(enhancedText, "enhanced-text.txt")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setText(enhancedText);
                    setEnhancedText("");
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Edit Enhanced Text
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextEditorComponent;


import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload, Play, Square, BarChart3, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StutterResultsChart } from "./StutterResultsChart";

type StutterType = "Block" | "Prolongation" | "Repetition" | "Interjection" | "Revision";

interface StutterResult {
  type: StutterType;
  confidence: number;
  count: number;
  examples: string[];
}

const AudioAnalysisComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StutterResult[] | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    // In a real app, this would use the MediaRecorder API
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    toast({
      title: "Recording started",
      description: "Speak clearly into your microphone",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Simulate creating an audio file
    const mockAudioFile = new File([""], "recording.wav", { type: "audio/wav" });
    setAudioFile(mockAudioFile);
    
    // Create a fake audio URL
    const mockAudioUrl = URL.createObjectURL(new Blob());
    setAudioUrl(mockAudioUrl);
    
    toast({
      title: "Recording stopped",
      description: `Recorded ${formatTime(recordingTime)} of audio`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      toast({
        title: "File uploaded",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    }
  };

  const analyzeAudio = () => {
    if (!audioFile) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Mock results - in a real app, this would come from ML models
            const mockResults: StutterResult[] = [
              {
                type: "Block",
                confidence: 0.85,
                count: 7,
                examples: ["b-b-book", "t-t-table"]
              },
              {
                type: "Prolongation",
                confidence: 0.78,
                count: 5,
                examples: ["sssssoon", "mmmmmaybe"]
              },
              {
                type: "Repetition",
                confidence: 0.92,
                count: 12,
                examples: ["and-and-and", "I-I-I"]
              },
              {
                type: "Interjection",
                confidence: 0.64,
                count: 3,
                examples: ["um", "uh"]
              },
              {
                type: "Revision",
                confidence: 0.71,
                count: 4,
                examples: ["I want- I need", "The blue- the red one"]
              }
            ];
            
            setResults(mockResults);
            setIsAnalyzing(false);
            
            toast({
              title: "Analysis complete",
              description: "Audio has been analyzed for stutter patterns",
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const resultsText = "Stutter Analysis Results\n\n" + 
      results.map(r => (
        `Type: ${r.type}\n` +
        `Confidence: ${(r.confidence * 100).toFixed(1)}%\n` +
        `Count: ${r.count}\n` +
        `Examples: ${r.examples.join(", ")}\n`
      )).join("\n");
    
    const element = document.createElement("a");
    const file = new Blob([resultsText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "stutter-analysis-results.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Results downloaded",
      description: "Analysis saved as text file",
    });
  };

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Audio Stutter Analysis</CardTitle>
          <CardDescription>
            Upload or record audio to analyze speech patterns and stutter types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="record">Record Audio</TabsTrigger>
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="space-y-4">
              <div className="flex flex-col items-center p-6 border rounded-md bg-muted/20">
                {isRecording ? (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                      <Mic size={48} className="text-white" />
                    </div>
                    <p className="text-xl font-medium">{formatTime(recordingTime)}</p>
                    <Button 
                      onClick={stopRecording}
                      variant="destructive"
                      size="lg"
                      className="mt-4"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={startRecording}
                    variant="outline"
                    size="lg"
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center p-6 border rounded-md bg-muted/20">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audio File
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {audioUrl && (
            <div className="mt-6 space-y-4">
              <div className="p-4 border rounded-md bg-muted/10">
                <p className="font-medium mb-2">Audio Preview</p>
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={analyzeAudio}
                  disabled={isAnalyzing || !audioFile}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze Stutter Patterns
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAudioFile(null);
                    setAudioUrl(null);
                    setResults(null);
                  }}
                  disabled={isAnalyzing}
                >
                  Clear Audio
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Analyzing audio through multiple ML models...
                  </p>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          )}
          
          {results && (
            <div className="mt-6 space-y-4">
              <div className="p-4 border rounded-md bg-muted/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Analysis Results</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadResults}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="h-64">
                    <StutterResultsChart results={results} />
                  </div>
                  
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={`
                                px-3 py-1
                                ${result.type === 'Block' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                ${result.type === 'Prolongation' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                ${result.type === 'Repetition' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                                ${result.type === 'Interjection' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                ${result.type === 'Revision' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              `}
                            >
                              {result.type}
                            </Badge>
                            <span className="font-medium">{result.count} instances</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Examples: </span>
                          {result.examples.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioAnalysisComponent;

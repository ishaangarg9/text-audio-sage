import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload, Square, BarChart3, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StutterResultsChart } from "./StutterResultsChart";
import { log } from "console";

type StutterType = "Block" | "Prolongation" | "Word Repetition" | "Interjection" | "Sound Repetition";

interface StutterResult {
  type: StutterType;
  confidence: number;
  count: number;
  examples: string[];
  percentage?: number;
}

const AudioAnalysisComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StutterResult[] | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchLastAnalysis();
  }, []);

  const fetchLastAnalysis = async () => {
    try {
      const res = await fetch('/api/audio/last');
      if (!res.ok) return;

      const data = await res.json();
      setResults([
        {
          type: "Block",
          count: 1,
          confidence: 1,
          examples: [data.analysisResult],
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch last analysis', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        setAudioFile(recordedFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
        toast({
          title: "Recording stopped",
          description: `Recorded ${formatTime(recordingTime)} of audio`,
        });
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access and try again.",
        variant: "destructive",
      });
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    if (!audioFile) {
      toast({
        title: "No audio selected",
        description: "Please record or upload an audio file to analyze.",
        variant: "destructive",
      });
      return;
    }
  
    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);
  
    const formData = new FormData();
    formData.append('file', audioFile);
  
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
  
          fetch('http://localhost:8081/api/audio/upload', {
            method: 'POST',
            body: formData,
          })
            .then(res => {
              if (!res.ok) throw new Error('Failed to upload audio');
              return res.json();
            })
            .then(data => {
              const transcription = JSON.parse(data.transcription);
  
              const cumulative = {
                block: 0,
                interjection: 0,
                prolongation: 0,
                soundrep: 0,
                wordrep: 0,
              };
  
              transcription.segments.forEach(segment => {
                cumulative.block += segment.block;
                cumulative.interjection += segment.interjection;
                cumulative.prolongation += segment.prolongation;
                cumulative.soundrep += segment.soundrep;
                cumulative.wordrep += segment.wordrep;
              });
              const totalCount = (cumulative.block + cumulative.interjection + cumulative.prolongation + cumulative.soundrep + cumulative.wordrep)/2;
              console.log("hit", totalCount)
              const formattedResults: (StutterResult & { percentage: number })[] = [
                {
                  type: "Block",
                  confidence: 1,
                  count: cumulative.block,
                  examples: [],
                  percentage: totalCount > 0 ? (cumulative.block / totalCount) * 100 : 0,
                },
                {
                  type: "Interjection",
                  confidence: 1,
                  count: cumulative.interjection,
                  examples: [],
                  percentage: totalCount > 0 ? (cumulative.interjection / totalCount) * 100 : 0,
                },
                {
                  type: "Prolongation",
                  confidence: 1,
                  count: cumulative.prolongation,
                  examples: [],
                  percentage: totalCount > 0 ? (cumulative.prolongation / totalCount) * 100 : 0,
                },
                {
                  type: "Sound Repetition",
                  confidence: 1,
                  count: cumulative.soundrep,
                  examples: [],
                  percentage: totalCount > 0 ? (cumulative.soundrep / totalCount) * 100 : 0,
                },
                {
                  type: "Word Repetition",
                  confidence: 1,
                  count: cumulative.wordrep,
                  examples: [],
                  percentage: totalCount > 0 ? (cumulative.wordrep / totalCount) * 100 : 0,
                },
              ];
  
              const formattedResultsWithPercent = formattedResults.map(item => ({
                ...item,
                percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
              }));
              
              setResults(formattedResultsWithPercent);
              setIsAnalyzing(false);
              toast({
                title: "Analysis complete",
                description: "Audio has been analyzed for stutter patterns",
              });
            })
            .catch(error => {
              console.error('Error analyzing audio:', error);
              setIsAnalyzing(false);
              toast({
                title: "Analysis failed",
                description: "There was a problem analyzing your audio.",
                variant: "destructive",
              });
            });
  
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
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
  const getSeverityLevel = (percentage: number): string => {
    if (percentage < 40) return "mild";
    if (percentage < 80) return "medium";
    return "high";
  };
  const StutterResultSummary = ({ result }: { result: StutterResult & { percentage: number } }) => {
    const [showDetails, setShowDetails] = useState(false);
    const percentage = result.percentage ?? 0;
    const severity = getSeverityLevel(result.percentage);
  
    return (
      <div className="mb-4 border p-4 rounded-md bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">
              You have <span className="capitalize">{result.type}</span> stuttering of <span className="font-bold">{severity}</span> level.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        {showDetails && (
          <div className="mt-2 text-sm text-gray-700">
            <p>Count: {result.count}</p>
            <p>Percentage: {result.percentage.toFixed(1)}%</p>
            {result.examples.length > 0 && (
              <p>Examples: {result.examples.join(", ")}</p>
            )}
          </div>
        )}
      </div>
    );
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
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audio File
                </Button>
                {audioFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected file: {audioFile.name} ({formatFileSize(audioFile.size)})
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full mt-6"
            />
          )}

          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={analyzeAudio}
              disabled={!audioFile || isAnalyzing}
              className="flex items-center"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analyze Audio
            </Button>
            {isAnalyzing && (
              <Progress value={progress} className="w-48" />
            )}
            {results && (
              <Button
                onClick={downloadResults}
                variant="outline"
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
            )}
          </div>

          {results && results.map(result => (
  <StutterResultSummary
    key={result.type}
    result={result as StutterResult & { percentage: number }}
  />
))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioAnalysisComponent;

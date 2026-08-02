import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import BottomNav from "@/components/BottomNav";
import PresenceTracker from "@/components/PresenceTracker";
import OfflineBanner from "@/components/OfflineBanner";

import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import ExamTaking from "./pages/ExamTaking";
import Leaderboard from "./pages/Leaderboard";
import Chat from "./pages/Chat";
import CreateRoom from "./pages/CreateRoom";
import AITutor from "./pages/AITutor";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Messages from "./pages/Messages";
import DirectMessage from "./pages/DirectMessage";
import People from "./pages/People";
import Auth from "./pages/Auth";
import Trivia from "./pages/Trivia";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Install from "./pages/Install";
import ExamHistory from "./pages/ExamHistory";
import Statistics from "./pages/Statistics";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PresenceTracker />
          <OfflineBanner />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exam/:subjectId" element={<ExamTaking />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/new" element={<CreateRoom />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            <Route path="/trivia" element={<Trivia />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/people" element={<People />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<DirectMessage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

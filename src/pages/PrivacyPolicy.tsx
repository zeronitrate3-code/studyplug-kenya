import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p><strong>Last updated:</strong> April 12, 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p>StudyPlug Kenya collects the following information when you use our app:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account information (name, email, profile picture) when you sign up</li>
          <li>Academic data (grade level, exam scores, quiz results)</li>
          <li>Chat messages in group discussions</li>
          <li>Usage data to improve the learning experience</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide and personalize the learning experience</li>
          <li>To track your progress and generate leaderboards</li>
          <li>To enable group chat and peer learning</li>
          <li>To improve our services and develop new features</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
        <p>We do not sell your personal information. Your data may be shared only:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect the safety of our users</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
        <p>We use industry-standard security measures including HTTPS encryption, secure authentication, and regular security audits to protect your data.</p>

        <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and all associated data</li>
          <li>Opt out of non-essential communications</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">6. Children's Privacy</h2>
        <p>StudyPlug Kenya is designed for students. We are committed to protecting children's privacy and comply with applicable child data protection regulations.</p>

        <h2 className="text-lg font-semibold text-foreground">7. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at <strong>support@studyplugkenya.com</strong>.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

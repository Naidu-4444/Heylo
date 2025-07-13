import { Lock, User, KeyRound, Mail, Fingerprint, Shield } from "lucide-react";

type AuthImagePatternProps = {
  title: string;
  subtitle: string;
};

const icons = [User, Lock, KeyRound, Mail, Fingerprint, Shield];

const AuthImagePattern = ({ title, subtitle }: AuthImagePatternProps) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className={`flex items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 transition-transform duration-300 ${
                i % 2 === 0 ? "animate-pulse" : "hover:scale-105"
              }`}
            >
              <Icon className="text-primary w-6 h-6" />
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4 font-stretch-semi-expanded">
          {title}
        </h2>
        <p className="text-base-content/60 font-stretch-extra-expanded">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthImagePattern;

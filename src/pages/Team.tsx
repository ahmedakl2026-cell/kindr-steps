import Layout from "@/components/Layout";
import { Users } from "lucide-react";

const teamMembers = [
  { name: "مريم أحمد عبد الله عقل", section: "سكشن 5" },
  { name: "مروه شبل عبد الحميد شديد", section: "سكشن 5" },
  { name: "منار محمود عبد الحكيم والي", section: "سكشن 5" },
  { name: "لبنى وحيد عبد الجابر سراج", section: "سكشن 5" },
  { name: "لمياء إمام الحسيني", section: "سكشن 5" },
  { name: "إيمان عماد عزت إبراهيم بحيري", section: "سكشن 1" },
  { name: "حنين طارق شفيق البطراوي", section: "سكشن 2" },
  { name: "بسملة أحمد أبو النور بلال", section: "سكشن 2" },
  { name: "حسناء ماهر كامل محفوظ", section: "سكشن 2" },
  { name: "ميرنا عصام الغمراوي", section: "سكشن 6" },
  { name: "ريهام عمرو النعماني", section: "سكشن 3" },
];

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary-foreground",
  "bg-accent/20 text-accent-foreground",
  "bg-kid-blue/20 text-kid-blue",
  "bg-kid-green/20 text-kid-green",
  "bg-kid-yellow/20 text-kid-yellow",
];

const Team = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            فريق العمل
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">من نحن</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تعرّف على فريق العمل الذي قام بتطوير منصة "خطوة"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-card card-hover text-center"
            >
              <div
                className={`w-16 h-16 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-2xl font-bold mx-auto mb-4`}
              >
                {member.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold mb-2">{member.name}</h3>
              <span className="inline-block bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
                {member.section}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;

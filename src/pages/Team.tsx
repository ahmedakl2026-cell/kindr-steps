import Layout from "@/components/Layout";
import { Users, Crown, GraduationCap } from "lucide-react";

import rababAvatar from "@/assets/avatars/rabab.png";
import naglaaAvatar from "@/assets/avatars/naglaa.png";
import mariamAvatar from "@/assets/avatars/mariam.png";
import marwaAvatar from "@/assets/avatars/marwa.png";
import manarAvatar from "@/assets/avatars/manar.png";
import lobnaAvatar from "@/assets/avatars/lobna.png";
import lamiaaAvatar from "@/assets/avatars/lamiaa.png";
import emanAvatar from "@/assets/avatars/eman.png";
import haneenAvatar from "@/assets/avatars/haneen.png";
import basmalaAvatar from "@/assets/avatars/basmala.png";
import hasnaaAvatar from "@/assets/avatars/hasnaa.png";
import mirnaAvatar from "@/assets/avatars/mirna.png";
import rehamAvatar from "@/assets/avatars/reham.png";

const supervisors = [
  { name: "أ.د/ رباب السيد مشعل", role: "قائد فريق العمل", avatar: rababAvatar },
  { name: "د/ نجلاء النشار", role: "إشراف", avatar: naglaaAvatar },
];

const teamMembers = [
  { name: "مريم أحمد عبد الله عقل", section: "سكشن 5", avatar: mariamAvatar },
  { name: "مروه شبل عبد الحميد شديد", section: "سكشن 5", avatar: marwaAvatar },
  { name: "منار محمود عبد الحكيم والي", section: "سكشن 5", avatar: manarAvatar },
  { name: "لبنى وحيد عبد الجابر سراج", section: "سكشن 5", avatar: lobnaAvatar },
  { name: "لمياء إمام الحسيني", section: "سكشن 5", avatar: lamiaaAvatar },
  { name: "إيمان عماد عزت إبراهيم بحيري", section: "سكشن 1", avatar: emanAvatar },
  { name: "حنين طارق شفيق البطراوي", section: "سكشن 2", avatar: haneenAvatar },
  { name: "بسملة أحمد أبو النور بلال", section: "سكشن 2", avatar: basmalaAvatar },
  { name: "حسناء ماهر كامل محفوظ", section: "سكشن 2", avatar: hasnaaAvatar },
  { name: "ميرنا عصام الغمراوي", section: "سكشن 6", avatar: mirnaAvatar },
  { name: "ريهام عمرو النعماني", section: "سكشن 3", avatar: rehamAvatar },
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

        {/* Supervisors Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {supervisors.map((sup, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 text-center shadow-md"
              >
                <div className="relative mx-auto mb-4 w-24 h-24">
                  <img
                    src={sup.avatar}
                    alt={sup.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
                  />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                    {index === 0 ? <Crown className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{sup.name}</h3>
                <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1 rounded-full">
                  {sup.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-card card-hover text-center"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-muted"
              />
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

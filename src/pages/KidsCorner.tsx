import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Smile, RotateCcw, Volume2 } from "lucide-react";

const emojis = ["🐱", "🐶", "🌟", "🎈", "🌈", "🦋", "🐱", "🐶", "🌟", "🎈", "🌈", "🦋"];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const KidsCorner = () => {
  const [cards, setCards] = useState(() => shuffleArray(emojis.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
  const [selected, setSelected] = useState<number[]>([]);
  const [points, setPoints] = useState(0);
  const [matches, setMatches] = useState(0);
  const [calmMode, setCalmMode] = useState(false);

  const handleFlip = (id: number) => {
    if (selected.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          const matched = [...newCards];
          matched[first] = { ...matched[first], matched: true };
          matched[second] = { ...matched[second], matched: true };
          setCards(matched);
          setSelected([]);
          setPoints((p) => p + 10);
          setMatches((m) => m + 1);
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...newCards];
          reset[first] = { ...reset[first], flipped: false };
          reset[second] = { ...reset[second], flipped: false };
          setCards(reset);
          setSelected([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(shuffleArray(emojis.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
    setSelected([]);
    setPoints(0);
    setMatches(0);
  };

  const allMatched = matches === emojis.length / 2;

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-500 ${calmMode ? "bg-khatwa-light-blue" : ""}`}>
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-khatwa-light-yellow text-accent-foreground rounded-full px-4 py-2 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              ركن الأطفال
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">هيا نلعب ونتعلم! 🎮</h1>
            <p className="text-muted-foreground text-lg">اقلب البطاقات وابحث عن الأزواج المتشابهة</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-5 py-3">
              <Trophy className="w-5 h-5 text-accent-foreground" />
              <span className="font-bold text-lg">{points}</span>
              <span className="text-sm text-muted-foreground">نقطة</span>
            </div>
            <Button variant="outline" className="rounded-2xl gap-2 btn-bounce" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
              لعبة جديدة
            </Button>
            <Button
              variant={calmMode ? "default" : "outline"}
              className="rounded-2xl gap-2 btn-bounce"
              onClick={() => setCalmMode(!calmMode)}
            >
              <Smile className="w-4 h-4" />
              وضع التهدئة
            </Button>
          </div>

          {/* Game */}
          {allMatched ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-float">🎉</div>
              <h2 className="text-3xl font-bold mb-4">أحسنت! لقد فزت!</h2>
              <p className="text-lg text-muted-foreground mb-6">حصلت على {points} نقطة</p>
              <Button size="lg" className="rounded-2xl btn-bounce" onClick={resetGame}>
                العب مرة أخرى
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-lg mx-auto">
              {cards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleFlip(i)}
                  className={`aspect-square rounded-2xl text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 btn-bounce border-2 ${
                    card.matched
                      ? "bg-khatwa-light-green border-secondary scale-95 opacity-70"
                      : card.flipped
                      ? "bg-card border-primary shadow-lg scale-105"
                      : "bg-muted border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
                  }`}
                >
                  {card.flipped || card.matched ? card.emoji : "❓"}
                </button>
              ))}
            </div>
          )}

          {/* Other games hint */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { title: "تعلم الحروف", emoji: "🔤", desc: "تعلم الحروف العربية بطريقة ممتعة" },
              { title: "الألوان", emoji: "🎨", desc: "تعرف على الألوان وميز بينها" },
              { title: "الأرقام", emoji: "🔢", desc: "عد واحسب مع شخصيات ظريفة" },
            ].map((game) => (
              <div key={game.title} className="p-5 rounded-2xl border border-border bg-card/50 text-center card-hover">
                <div className="text-4xl mb-3">{game.emoji}</div>
                <h3 className="font-bold mb-1">{game.title}</h3>
                <p className="text-sm text-muted-foreground">{game.desc}</p>
                <span className="inline-block mt-3 text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">قريباً</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KidsCorner;

import { Flame, MessageSquareText, Users } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const communityItems = [
  {
    title: "Prompt teardown: product launches",
    description: "See how creators are tuning launch prompts for sharper offers, clearer hooks, and stronger CTAs.",
    meta: "128 replies",
    icon: MessageSquareText,
  },
  {
    title: "Weekly remix challenge",
    description: "Take one prompt and adapt it for ChatGPT, Claude, Midjourney, and Runway in a single thread.",
    meta: "42 submissions",
    icon: Flame,
  },
  {
    title: "Creator circles",
    description: "Join niche groups for growth marketers, content teams, indie founders, and visual storytellers.",
    meta: "12 active groups",
    icon: Users,
  },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container py-12">
        <section className="mb-10 rounded-[2rem] border border-border bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-amber-400/10 p-8 shadow-sm">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-primary">Community</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight">Learn from how other builders shape prompts in the wild</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Community brings together shared prompt collections, adaptation challenges, and workflow notes from people actually shipping with AI tools every week.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90">Join the conversation</Button>
            <Button variant="outline">Browse public collections</Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {communityItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
                <CardHeader>
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <div className="text-sm font-medium text-foreground">{item.meta}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
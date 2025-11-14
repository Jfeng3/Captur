import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Clock,
  Brain,
  Heart,
  X,
  Check,
  Zap,
  BookOpen,
  Volume2,
  FolderOpen,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Star,
} from 'lucide-react';

export default function LandingZhCN() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url(/watercolor-background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              Captur
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" size="sm" asChild>
                <a href="#how-it-works">功能特色</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#benefits">核心优势</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#testimonials">用户评价</a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="#">登录</a>
              </Button>
              <Button size="sm" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">开始使用</a>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-6 text-sm">
                为英语学习者和专业人士打造
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                从你喜欢的内容中积累词汇
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                将你喜欢的 YouTube 视频、文章和博客转化为系统化的词汇学习。一键保存为闪卡。
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                    开始积累词汇
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-12">
                <Card className="overflow-hidden border-2">
                  <div className="bg-muted p-8">
                    <video
                      src="/product_demo.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="rounded-lg shadow-2xl w-full"
                      aria-label="Captur 产品演示视频"
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        video.play().catch((err) => {
                          console.log('Autoplay prevented:', err);
                        });
                      }}
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                词汇量增长缓慢
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                每周消费 10+ 小时英语内容——YouTube、文章、播客——但词汇量增长速度与投入时间不成正比
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">查词破坏沉浸感</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    暂停查词打断阅读流。在内容 → 词典 → 笔记之间切换，每小时浪费 15+ 分钟。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">手动记录耗时繁琐</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    在笔记本上记单词每个需要 2-3 分钟。手动制作闪卡更慢——摩擦力扼杀了坚持。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">缺乏系统复习</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    没有间隔重复，一周内忘记 90% 的新单词。你喜欢的内容变成了浪费的学习机会。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                为什么现有方案都失败了
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                现有工具要么帮你查词，要么保存，要么复习——但从未创建无缝的"从内容中学习"工作流
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {/* Flashcard Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">闪卡应用（Anki、Quizlet）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">手动制卡繁琐（每个单词 3-5 分钟）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">与实际内容消费脱节</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">无法在看 YouTube 或阅读文章时捕获</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Language Learning Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">语言学习应用（Duolingo、Babbel）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">通用词汇列表——不针对你的兴趣个性化</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">无法从你喜欢的 YouTube 频道学习</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">与你真正喜欢的内容相比太无聊</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Dictionary Extensions */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">词典扩展</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">没有保存或复习系统——反复查同一个词</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">不帮助记忆——即时查询然后忘记</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">没有间隔重复或系统复习</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Manual Notebooks */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <FolderOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">笔记本和 Google 文档</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">极其繁琐——每次遇到新单词都打断流程</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">没有间隔重复——只是从未复习的静态列表</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">列表堆积但不转化为记住的词汇</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">无法练习发音或回忆</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">只捕获不练习无法培养流利度</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                你无法外包可信度。建立 AI 无法给你的内化流利度。
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                如何工作
              </Badge>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                从你喜欢的内容中积累词汇
              </h2>
              <p className="mt-4 text-xl text-primary">从你喜欢的 YouTuber、博客、话题中捕获词汇。翻译速度快 30 倍。闪卡制作速度快 600 倍。</p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 1: Partial Translation */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/hover-translate-demo.png"
                    alt="悬停翻译难词"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">悬停翻译（仅难词）</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 选择任何单词 → 悬停在青色圆点上</li>
                    <li>• 即时显示内联翻译</li>
                    <li>• 仅高亮难词</li>
                    <li>• 保持语言环境同时学习</li>
                    <li>• 比词典查询快 30 倍</li>
                  </ul>
                </div>
              </div>

              {/* Feature 2: One-Click Save + Spaced Repetition */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">一键保存 + 间隔重复</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 点击词汇按钮 → 绿色对勾</li>
                    <li>• 单词即时保存到闪卡</li>
                    <li>• 按最佳间隔复习：1天、3天、1周、2周、1月</li>
                    <li>• 比手动制卡快 600 倍</li>
                    <li>• 保证 80%+ 记忆率</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/flashcard-save-demo.png"
                    alt="一键保存与间隔重复"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Feature 3: YouTube Transcript + Key Takeaways */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/youtube-transscript-demo3.png"
                    alt="YouTube 字幕与重点摘要"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">YouTube 字幕 + 重点摘要</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 观看视频 + 阅读同步字幕</li>
                    <li>• 自动高亮难词</li>
                    <li>• "重点摘要"提取 10-15 个挑战性词汇</li>
                    <li>• 即时保存任何单词为闪卡</li>
                  </ul>
                </div>
              </div>

              {/* Feature 4: Sticky Notes */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">任何网页上的便签</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 添加笔记、思考和重点摘要</li>
                    <li>• 适用于你访问的任何网页</li>
                    <li>• 词汇和见解与内容同在</li>
                    <li>• 随时返回在原始上下文中复习</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/sticky-note-demo.png"
                    alt="网页便签"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                更聪明地学习，而非更努力
              </h2>
            </div>
            <div className="mt-12 grid gap-12 text-center sm:grid-cols-3">
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">查询速度快 30 倍</h3>
                <p className="mt-2 text-muted-foreground">
                  传统词典：每个单词 15-20 秒。悬停翻译：0.5 秒。零上下文切换，零中断。
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">80% 记忆率</h3>
                <p className="mt-2 text-muted-foreground">
                  间隔重复将 30 天后的长期记忆率从 10% 提高到 80%+。可视化按钮创建更强的记忆关联。
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Volume2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">从你喜欢的话题学习</h3>
                <p className="mt-2 text-muted-foreground">
                  从你真正喜欢的内容中积累词汇。科技视频、商业文章、爱好博客、娱乐内容——任何符合你兴趣的。不是通用单词表。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="testimonials" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                英语学习者的评价
              </h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
                      alt="Maria Kim"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">Maria Kim</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Captur 对我的雅思备考是一个改变游戏规则的工具。我终于能记住所有需要的学术词汇了！"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=James"
                      alt="James Chen"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">James Chen</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "浏览器扩展简直是天才之作。我在阅读文章时捕获单词，它们会自动添加到我的学习列表中。太简单了！"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                      alt="Sarah Park"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">Sarah Park</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "我试过很多应用，但这是第一个真正有效的。间隔重复系统非常有效。"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                常见问题
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">这与 Anki 有什么不同？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anki 需要手动制作闪卡并显示孤立的单词。Captur 即时捕获单词并完整保留上下文，还包括发音练习。无需手动制卡。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">需要安装什么吗？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    需要安装 Chrome 浏览器扩展。安装后即可在任何网页上使用悬停翻译、一键保存和 AI 辅助功能。所有数据自动同步到 captur.academy。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">可以在手机上使用吗？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    可以！Captur 完全响应式，适用于所有设备。在手机上阅读时捕获词汇，然后在桌面上复习。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">发音练习如何工作？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    点击任何保存的单词或句子即可听到文本转语音朗读。根据需要练习多次以建立信心。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">300 字限制是什么？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    每条笔记最多可包含 300 个单词，以按主题或话题组织你的词汇。这可以防止列表过长，并鼓励集中复习。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">简单透明的定价</h2>
              <p className="mt-4 text-lg text-muted-foreground">选择适合你学习目标的计划。</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
              <Card className="w-full lg:w-1/3 border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">免费</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    ¥0<span className="text-base font-normal text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">最多 100 个单词</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">基础间隔重复</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">浏览器扩展</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">开始使用</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full lg:w-1/3 border-2 border-primary shadow-2xl relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">最受欢迎</Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">专业版</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    ¥49<span className="text-base font-normal text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">无限单词</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">高级间隔重复</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">完整上下文和例句</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">高级进度跟踪</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">升级专业版</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-muted px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              从你喜欢的内容中积累词汇
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              停止在无聊的语言应用和通用单词表上浪费时间。将你喜欢的 YouTube 视频、文章和博客转化为系统化的词汇学习。一键保存为闪卡——零手动工作。
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-lg" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                  免费开始积累词汇
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>翻译速度快 30 倍</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>闪卡制作速度快 600 倍</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>适用于 YouTube、文章、博客</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-bold text-primary">Captur</p>
                <p className="text-sm text-muted-foreground">捕获词汇。培养流利度。</p>
              </div>
              <div className="flex space-x-6 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">博客</a>
                <a href="#" className="hover:text-primary transition-colors">联系</a>
                <a href="/privacy" className="hover:text-primary transition-colors">隐私</a>
                <a href="#" className="hover:text-primary transition-colors">条款</a>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">English</a>
                <span>•</span>
                <a href="/fr" className="hover:text-primary transition-colors">Français</a>
                <span>•</span>
                <a href="/zh-CN" className="hover:text-primary transition-colors font-semibold">简体中文</a>
                <span>•</span>
                <a href="/zh-TW" className="hover:text-primary transition-colors">繁體中文</a>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 Captur. 保留所有权利。</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

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

export default function LandingZhTW() {
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
                <a href="#benefits">核心優勢</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#testimonials">用戶評價</a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="#">登入</a>
              </Button>
              <Button size="sm" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">開始使用</a>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-6 text-sm">
                為英語學習者和專業人士打造
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                從你喜歡的內容中累積詞彙
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                將你喜歡的 YouTube 影片、文章和部落格轉化為系統化的詞彙學習。一鍵儲存為閃卡。
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                    開始累積詞彙
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
                      aria-label="Captur 產品示範影片"
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        video.play().catch((err) => {
                          console.log('Autoplay prevented:', err);
                        });
                      }}
                    >
                      您的瀏覽器不支援影片播放。
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
                詞彙量增長緩慢
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                每週消費 10+ 小時英語內容——YouTube、文章、播客——但詞彙量增長速度與投入時間不成正比
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">查詞破壞沉浸感</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    暫停查詞打斷閱讀流。在內容 → 詞典 → 筆記之間切換，每小時浪費 15+ 分鐘。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">手動記錄耗時繁瑣</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    在筆記本上記單字每個需要 2-3 分鐘。手動製作閃卡更慢——摩擦力扼殺了堅持。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">缺乏系統複習</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    沒有間隔重複，一週內忘記 90% 的新單字。你喜歡的內容變成了浪費的學習機會。
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
                為什麼現有方案都失敗了
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                現有工具要麼幫你查詞，要麼儲存，要麼複習——但從未創建無縫的「從內容中學習」工作流
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {/* Flashcard Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">閃卡應用（Anki、Quizlet）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">手動製卡繁瑣（每個單字 3-5 分鐘）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">與實際內容消費脫節</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">無法在看 YouTube 或閱讀文章時捕獲</span>
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
                  <CardTitle className="text-xl text-center">語言學習應用（Duolingo、Babbel）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">通用詞彙列表——不針對你的興趣個性化</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">無法從你喜歡的 YouTube 頻道學習</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">與你真正喜歡的內容相比太無聊</span>
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
                  <CardTitle className="text-xl text-center">詞典擴充功能</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">沒有儲存或複習系統——反覆查同一個詞</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">不幫助記憶——即時查詢然後忘記</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">沒有間隔重複或系統複習</span>
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
                  <CardTitle className="text-xl text-center">筆記本和 Google 文件</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">極其繁瑣——每次遇到新單字都打斷流程</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">沒有間隔重複——只是從未複習的靜態列表</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">列表堆積但不轉化為記住的詞彙</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">無法練習發音或回憶</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">只捕獲不練習無法培養流利度</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                你無法外包可信度。建立 AI 無法給你的內化流利度。
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                如何運作
              </Badge>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                從你喜歡的內容中累積詞彙
              </h2>
              <p className="mt-4 text-xl text-primary">從你喜歡的 YouTuber、部落格、話題中捕獲詞彙。翻譯速度快 30 倍。閃卡製作速度快 600 倍。</p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 1: Partial Translation */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/hover-translate-demo.png"
                    alt="懸停翻譯難詞"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">懸停翻譯（僅難詞）</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 選擇任何單字 → 懸停在青色圓點上</li>
                    <li>• 即時顯示內聯翻譯</li>
                    <li>• 僅標示難詞</li>
                    <li>• 保持語言環境同時學習</li>
                    <li>• 比詞典查詢快 30 倍</li>
                  </ul>
                </div>
              </div>

              {/* Feature 2: One-Click Save + Spaced Repetition */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">一鍵儲存 + 間隔重複</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 點選詞彙按鈕 → 綠色勾選</li>
                    <li>• 單字即時儲存到閃卡</li>
                    <li>• 按最佳間隔複習：1天、3天、1週、2週、1月</li>
                    <li>• 比手動製卡快 600 倍</li>
                    <li>• 保證 80%+ 記憶率</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/flashcard-save-demo.png"
                    alt="一鍵儲存與間隔重複"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Feature 3: YouTube Transcript + Key Takeaways */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/youtube-transscript-demo3.png"
                    alt="YouTube 字幕與重點摘要"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">YouTube 字幕 + 重點摘要</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 觀看影片 + 閱讀同步字幕</li>
                    <li>• 自動標示難詞</li>
                    <li>• 「重點摘要」提取 10-15 個挑戰性詞彙</li>
                    <li>• 即時儲存任何單字為閃卡</li>
                  </ul>
                </div>
              </div>

              {/* Feature 4: Sticky Notes */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">任何網頁上的便利貼</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• 新增筆記、思考和重點摘要</li>
                    <li>• 適用於你訪問的任何網頁</li>
                    <li>• 詞彙和見解與內容同在</li>
                    <li>• 隨時返回在原始情境中複習</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/sticky-note-demo.png"
                    alt="網頁便利貼"
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
                更聰明地學習，而非更努力
              </h2>
            </div>
            <div className="mt-12 grid gap-12 text-center sm:grid-cols-3">
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">查詢速度快 30 倍</h3>
                <p className="mt-2 text-muted-foreground">
                  傳統詞典：每個單字 15-20 秒。懸停翻譯：0.5 秒。零情境切換，零中斷。
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">80% 記憶率</h3>
                <p className="mt-2 text-muted-foreground">
                  間隔重複將 30 天後的長期記憶率從 10% 提高到 80%+。視覺化按鈕創建更強的記憶關聯。
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Volume2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">從你喜歡的話題學習</h3>
                <p className="mt-2 text-muted-foreground">
                  從你真正喜歡的內容中累積詞彙。科技影片、商業文章、愛好部落格、娛樂內容——任何符合你興趣的。不是通用單字表。
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
                英語學習者的評價
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
                    "Captur 對我的雅思備考是一個改變遊戲規則的工具。我終於能記住所有需要的學術詞彙了！"
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
                    "瀏覽器擴充功能簡直是天才之作。我在閱讀文章時捕獲單字，它們會自動新增到我的學習列表中。太簡單了！"
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
                    "我試過很多應用，但這是第一個真正有效的。間隔重複系統非常有效。"
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
                常見問題
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">這與 Anki 有什麼不同？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anki 需要手動製作閃卡並顯示孤立的單字。Captur 即時捕獲單字並完整保留情境，還包括發音練習。無需手動製卡。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">需要安裝什麼嗎？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    需要安裝 Chrome 瀏覽器擴充功能。安裝後即可在任何網頁上使用懸停翻譯、一鍵儲存和 AI 輔助功能。所有資料自動同步到 captur.academy。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">可以在手機上使用嗎？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    可以！Captur 完全響應式，適用於所有裝置。在手機上閱讀時捕獲詞彙，然後在桌機上複習。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">發音練習如何運作？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    點選任何儲存的單字或句子即可聽到文字轉語音朗讀。根據需要練習多次以建立信心。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">300 字限制是什麼？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    每條筆記最多可包含 300 個單字，以按主題或話題組織你的詞彙。這可以防止列表過長，並鼓勵集中複習。
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">簡單透明的定價</h2>
              <p className="mt-4 text-lg text-muted-foreground">選擇適合你學習目標的方案。</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
              <Card className="w-full lg:w-1/3 border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">免費</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    NT$0<span className="text-base font-normal text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">最多 100 個單字</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">基礎間隔重複</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">瀏覽器擴充功能</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">開始使用</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full lg:w-1/3 border-2 border-primary shadow-2xl relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">最受歡迎</Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">專業版</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    NT$210<span className="text-base font-normal text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">無限單字</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">進階間隔重複</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">完整情境和例句</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">進階進度追蹤</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">升級專業版</a>
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
              從你喜歡的內容中累積詞彙
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              停止在無聊的語言應用和通用單字表上浪費時間。將你喜歡的 YouTube 影片、文章和部落格轉化為系統化的詞彙學習。一鍵儲存為閃卡——零手動工作。
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-lg" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                  免費開始累積詞彙
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>翻譯速度快 30 倍</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>閃卡製作速度快 600 倍</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>適用於 YouTube、文章、部落格</span>
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
                <p className="text-sm text-muted-foreground">捕獲詞彙。培養流利度。</p>
              </div>
              <div className="flex space-x-6 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">部落格</a>
                <a href="#" className="hover:text-primary transition-colors">聯絡</a>
                <a href="/privacy" className="hover:text-primary transition-colors">隱私</a>
                <a href="#" className="hover:text-primary transition-colors">條款</a>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">English</a>
                <span>•</span>
                <a href="/fr" className="hover:text-primary transition-colors">Français</a>
                <span>•</span>
                <a href="/zh-CN" className="hover:text-primary transition-colors">简体中文</a>
                <span>•</span>
                <a href="/zh-TW" className="hover:text-primary transition-colors font-semibold">繁體中文</a>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 Captur. 保留所有權利。</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

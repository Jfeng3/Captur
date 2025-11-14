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

export default function LandingFr() {
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
                <a href="#how-it-works">Fonctionnalités</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#benefits">Avantages</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#testimonials">Témoignages</a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="#">Se connecter</a>
              </Button>
              <Button size="sm" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Commencer</a>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-6 text-sm">
                Pour les étudiants et professionnels en anglais
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Enrichissez votre vocabulaire à partir du contenu que vous aimez
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Transformez vos vidéos YouTube, articles et blogs préférés en apprentissage systématique du vocabulaire. Cliquez pour enregistrer comme carte mémoire.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                    Commencer à enrichir votre vocabulaire
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
                      aria-label="Vidéo de démonstration de Captur"
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        video.play().catch((err) => {
                          console.log('Autoplay prevented:', err);
                        });
                      }}
                    >
                      Votre navigateur ne prend pas en charge la vidéo.
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
                Votre vocabulaire ne s'enrichit pas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Vous consommez 10+ heures de contenu anglais par semaine—YouTube, articles, podcasts—mais votre vocabulaire ne progresse pas proportionnellement au temps investi
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Les recherches cassent l'immersion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chercher des mots interrompt votre lecture. Basculer entre contenu → dictionnaire → notes vous fait perdre 15+ minutes par heure.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Le suivi manuel est fastidieux</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Noter des mots dans un cahier prend 2-3 minutes par mot. Créer des cartes mémoire manuellement est encore plus lent—cette friction tue la constance.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Pas de révision systématique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sans répétition espacée, vous oubliez 90% des nouveaux mots en une semaine. Votre contenu préféré devient des occasions d'apprentissage gaspillées.
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
                Pourquoi les solutions actuelles échouent
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Les outils existants vous aident à chercher des mots OU à les sauvegarder OU à les réviser—mais ne créent jamais un flux de travail d'apprentissage à partir de contenu
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {/* Flashcard Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">Applications de cartes mémoire (Anki, Quizlet)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Créer des cartes manuellement est fastidieux (3-5 minutes par mot)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Déconnecté de votre consommation de contenu réelle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Impossible de capturer en regardant YouTube ou en lisant des articles</span>
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
                  <CardTitle className="text-xl text-center">Applications d'apprentissage (Duolingo, Babbel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Listes de vocabulaire génériques—non personnalisées selon vos intérêts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Impossible d'apprendre à partir de VOS chaînes YouTube préférées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Ennuyeux comparé au contenu que vous aimez vraiment</span>
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
                  <CardTitle className="text-xl text-center">Extensions de dictionnaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Pas de système de sauvegarde ou révision—vous cherchez le même mot encore et encore</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">N'aide pas à la rétention—recherche instantanée puis oubli</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Pas de répétition espacée ou révision systématique</span>
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
                  <CardTitle className="text-xl text-center">Carnets et Google Docs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Extrêmement fastidieux—casse le flux à chaque nouveau mot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Pas de répétition espacée—juste des listes statiques jamais révisées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Les listes s'accumulent mais ne se transforment pas en vocabulaire retenu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Impossible de pratiquer la prononciation ou le rappel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Capturer sans pratiquer ne développe pas la fluidité</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                Vous ne pouvez pas externaliser la crédibilité. Développez une fluidité internalisée que l'IA ne peut pas vous donner.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                Comment ça marche
              </Badge>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Enrichissez votre vocabulaire à partir du contenu que vous aimez
              </h2>
              <p className="mt-4 text-xl text-primary">Capturez des termes de vos YouTubeurs, blogs et sujets préférés. Traduction 30x plus rapide. Création de cartes mémoire 600x plus rapide.</p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 1: Partial Translation */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/hover-translate-demo.png"
                    alt="Survoler pour traduire les mots difficiles"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Survoler pour traduire (mots difficiles uniquement)</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Sélectionnez n'importe quel mot → survolez le point turquoise</li>
                    <li>• Traduction en ligne instantanée</li>
                    <li>• Seuls les mots difficiles sont surlignés</li>
                    <li>• Restez dans le contexte linguistique tout en apprenant</li>
                    <li>• 30x plus rapide que la recherche dans un dictionnaire</li>
                  </ul>
                </div>
              </div>

              {/* Feature 2: One-Click Save + Spaced Repetition */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">Sauvegarde en un clic + répétition espacée</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Cliquez sur le bouton vocabulaire → coche verte</li>
                    <li>• Mot enregistré instantanément dans les cartes mémoire</li>
                    <li>• Révision à intervalles optimaux : 1j, 3j, 1s, 2s, 1m</li>
                    <li>• 600x plus rapide que la création manuelle de cartes</li>
                    <li>• Rétention garantie de 80%+</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/flashcard-save-demo.png"
                    alt="Sauvegarde en un clic avec répétition espacée"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Feature 3: YouTube Transcript + Key Takeaways */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/youtube-transscript-demo3.png"
                    alt="Transcription YouTube avec points clés"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Transcription YouTube + points clés</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Regardez la vidéo + lisez la transcription synchronisée</li>
                    <li>• Mots difficiles surlignés automatiquement</li>
                    <li>• Les "points clés" extraient 10-15 termes difficiles</li>
                    <li>• Enregistrez n'importe quel mot comme carte mémoire instantanément</li>
                  </ul>
                </div>
              </div>

              {/* Feature 4: Sticky Notes */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">Notes collantes sur n'importe quelle page</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Ajoutez des notes, réflexions et points clés</li>
                    <li>• Fonctionne sur n'importe quelle page que vous visitez</li>
                    <li>• Le vocabulaire et les insights restent avec le contenu</li>
                    <li>• Revenez à tout moment pour réviser dans le contexte original</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/sticky-note-demo.png"
                    alt="Notes collantes sur les pages web"
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
                Apprenez plus intelligemment, pas plus difficilement
              </h2>
            </div>
            <div className="mt-12 grid gap-12 text-center sm:grid-cols-3">
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Recherche 30x plus rapide</h3>
                <p className="mt-2 text-muted-foreground">
                  Dictionnaire traditionnel : 15-20 secondes par mot. Survol pour traduire : 0,5 seconde. Zéro changement de contexte, zéro interruption.
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Rétention de 80%</h3>
                <p className="mt-2 text-muted-foreground">
                  La répétition espacée augmente la rétention à long terme de 10% à 80%+ après 30 jours. Les boutons visuels créent des associations mémorielles plus fortes.
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Volume2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Apprenez à partir de sujets que vous aimez</h3>
                <p className="mt-2 text-muted-foreground">
                  Enrichissez votre vocabulaire à partir du contenu que vous aimez vraiment. Vidéos tech, articles business, blogs hobbies, contenu divertissement—tout ce qui correspond à vos intérêts. Pas de listes de mots génériques.
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
                Ce que disent les apprenants d'anglais
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
                    "Captur a changé la donne pour ma préparation IELTS. Je peux enfin retenir tous les mots académiques dont j'ai besoin !"
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
                    "L'extension de navigateur est géniale. Je capture des mots en lisant des articles et ils sont automatiquement ajoutés à ma liste d'étude. Trop facile !"
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
                    "J'ai essayé beaucoup d'applications, mais c'est la première qui fonctionne vraiment. Le système de répétition espacée est incroyablement efficace."
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
                Questions fréquentes
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quelle est la différence avec Anki ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anki nécessite la création manuelle de cartes mémoire et affiche des mots isolés. Captur capture les mots instantanément avec le contexte complet préservé, et inclut la pratique de prononciation. Aucune création manuelle de cartes nécessaire.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dois-je installer quelque chose ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Vous devez installer l'extension Chrome. Une fois installée, vous pouvez utiliser le survol pour traduire, la sauvegarde en un clic et les fonctionnalités d'assistance IA sur n'importe quelle page web. Toutes les données se synchronisent automatiquement avec captur.academy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Puis-je l'utiliser sur mobile ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Oui ! Captur est entièrement responsive et fonctionne sur tous les appareils. Capturez du vocabulaire sur votre téléphone en lisant, puis révisez sur votre ordinateur.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comment fonctionne la pratique de prononciation ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cliquez sur n'importe quel mot ou phrase enregistré pour l'entendre lu à haute voix grâce à la technologie de synthèse vocale. Pratiquez autant de fois que nécessaire pour gagner en confiance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quelle est la limite de 300 mots ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chaque note peut contenir jusqu'à 300 mots pour organiser votre vocabulaire par thème ou sujet. Cela évite les listes écrasantes et encourage des sessions de révision ciblées.
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Tarification simple et transparente</h2>
              <p className="mt-4 text-lg text-muted-foreground">Choisissez le plan adapté à vos objectifs d'apprentissage.</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
              <Card className="w-full lg:w-1/3 border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Gratuit</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    0€<span className="text-base font-normal text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Jusqu'à 100 mots</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Répétition espacée de base</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Extension de navigateur</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Commencer</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full lg:w-1/3 border-2 border-primary shadow-2xl relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Le plus populaire</Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    7€<span className="text-base font-normal text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Mots illimités</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Répétition espacée avancée</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Contexte complet et exemples</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Suivi de progression avancé</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Passer à Pro</a>
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
              Enrichissez votre vocabulaire à partir du contenu que vous aimez
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Arrêtez de perdre du temps sur des applications de langues ennuyeuses avec des listes de mots génériques. Transformez vos vidéos YouTube, articles et blogs préférés en apprentissage systématique du vocabulaire. Cliquez pour enregistrer comme carte mémoire—sans effort manuel.
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-lg" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                  Commencez gratuitement à enrichir votre vocabulaire
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Traduction 30x plus rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Création de cartes 600x plus rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Fonctionne sur YouTube, articles, blogs</span>
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
                <p className="text-sm text-muted-foreground">Capturez du vocabulaire. Développez la fluidité.</p>
              </div>
              <div className="flex space-x-6 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Blog</a>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
                <a href="/privacy" className="hover:text-primary transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-primary transition-colors">Conditions</a>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">English</a>
                <span>•</span>
                <a href="/fr" className="hover:text-primary transition-colors font-semibold">Français</a>
                <span>•</span>
                <a href="/zh-CN" className="hover:text-primary transition-colors">简体中文</a>
                <span>•</span>
                <a href="/zh-TW" className="hover:text-primary transition-colors">繁體中文</a>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 Captur. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

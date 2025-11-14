export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-4xl px-6 py-4">
          <a href="/" className="text-2xl font-bold text-primary">
            Captur
          </a>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 5, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Captur ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension and web application.
            </p>
          </section>

          {/* Single Purpose */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Single Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              Captur helps users capture vocabulary expressions from web pages, generate AI-powered key takeaways from content, and get AI writing assistance for language learning purposes. This is our sole purpose and we collect only the minimum data necessary to provide this functionality.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We only collect information when you explicitly take action to save vocabulary:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Text Content:</strong> Only text you explicitly select and save via right-click context menu, double-shift shortcut, or when you click "Generate Key Takeaways" button</li>
              <li><strong>Page Content:</strong> When you click "Generate Key Takeaways", we access the current page's text content to extract vocabulary and generate AI-powered summaries</li>
              <li><strong>Page URL:</strong> The URL of the webpage where you saved vocabulary (to provide context for your expressions)</li>
              <li><strong>Timestamp:</strong> When you saved the vocabulary item</li>
              <li><strong>User Preferences:</strong> Extension settings stored locally in your browser</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>We do NOT collect:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Browsing history</li>
              <li>Personally identifiable information (name, email, etc.)</li>
              <li>Health information</li>
              <li>Financial information</li>
              <li>Personal communications</li>
              <li>Location data</li>
              <li>Any data from pages you visit without explicitly saving text</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the collected information solely for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing vocabulary learning and language education services</li>
              <li>Storing your saved expressions in your Captur account</li>
              <li>Organizing vocabulary by context (page source URL)</li>
              <li>Syncing your vocabulary across devices when you're logged in</li>
              <li>Generating AI-powered key takeaways and vocabulary extraction when you click the "Key Takeaways" button</li>
              <li>Providing AI writing assistance (rephrase, translate, simplify) when you use the double-shift tooltip</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>We do NOT:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Sell your data to third parties</li>
              <li>Share your data with third parties</li>
              <li>Use your data for advertising</li>
              <li>Use your data for purposes unrelated to vocabulary learning</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Secure Transmission:</strong> All data is transmitted securely using HTTPS to https://www.captur.academy/</li>
              <li><strong>Local Storage:</strong> User preferences are stored locally in your browser using Chrome's storage API</li>
              <li><strong>Server Storage:</strong> Saved vocabulary is stored in our secure database hosted on Supabase (PostgreSQL)</li>
              <li><strong>No Remote Code:</strong> Our extension does NOT execute any remote code. All JavaScript is bundled within the extension package</li>
            </ul>
          </section>

          {/* Permissions Explained */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Chrome Permissions Explained</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Captur requests only the minimum permissions necessary:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li>
                <strong>storage:</strong> Store user preferences and extension settings locally to maintain your configuration across browser sessions
              </li>
              <li>
                <strong>activeTab:</strong> Access the current tab's content only when you explicitly save selected text, generate takeaways, or use AI writing features. Required to capture your selected text and page content
              </li>
              <li>
                <strong>contextMenus:</strong> Add "Save with Captur" option to right-click context menu for quick access
              </li>
              <li>
                <strong>notifications:</strong> Show success/error notifications when saving vocabulary to provide immediate feedback
              </li>
              <li>
                <strong>scripting:</strong> Required to inject the floating widget, AI writing assistant tooltip, and key takeaways interface into web pages. Only executes when you interact with extension features
              </li>
              <li>
                <strong>Host permission (https://www.captur.academy/*):</strong> Required to send saved vocabulary to your Captur account via secure API. Data transmission only occurs when you explicitly save text or use AI features
              </li>
              <li>
                <strong>Content scripts (all_urls):</strong> Enable the floating widget, AI writing assistant tooltip, and text selection capture. Script only activates when you explicitly select text and press double-shift or click the floating widget. No data is collected without your explicit action
              </li>
            </ul>
          </section>

          {/* User Consent and Control */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">User Consent and Control</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Prominent Disclosure:</strong> You are clearly informed through the extension's UI that data will be collected:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Context menu "Save with Captur" - indicates text will be saved</li>
              <li>Double-shift tooltip with AI buttons - indicates AI processing will occur</li>
              <li>"✨ Key Takeaways" floating button - indicates page content will be analyzed</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Your Rights:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You control what text is saved - nothing is captured without your explicit action</li>
              <li>You can delete any saved vocabulary from your account at captur.academy</li>
              <li>You can uninstall the extension at any time</li>
              <li>Contact us at support@captur.academy to request data deletion</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your saved vocabulary indefinitely to provide ongoing language learning services. You can delete any vocabulary items at any time from your account at captur.academy. If you uninstall the extension and request account deletion, we will delete your data within 30 days.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services to provide our functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong>Supabase (PostgreSQL):</strong> Secure database hosting for your saved vocabulary</li>
              <li><strong>Vercel:</strong> Application hosting and serverless functions</li>
              <li><strong>OpenAI API:</strong> AI-powered features for key takeaways generation, vocabulary extraction, and writing assistance (rephrase, translate, simplify). Data is sent only when you explicitly click AI feature buttons. Selected text and page content are sent via our secure backend to OpenAI for generating AI responses. Data is not stored by OpenAI per their API usage policy.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies. We do not share your data with these services beyond what's necessary to provide our core functionality. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong>OpenAI:</strong> Text is sent only when you use AI features (Key Takeaways, rephrase, translate, simplify). OpenAI processes the data to generate responses and does not store it for training purposes (per API usage terms).</li>
              <li><strong>Supabase:</strong> Stores only your saved vocabulary, page URLs, and timestamps.</li>
              <li><strong>Vercel:</strong> Hosts our application and routes API requests securely.</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Captur is suitable for all ages. We do not knowingly collect personal information from children under 13. Our extension collects only vocabulary text that users explicitly save, regardless of age.
            </p>
          </section>

          {/* GDPR and CCPA Compliance */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">GDPR and CCPA Compliance</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are a resident of the European Union or California, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Right to Access:</strong> Request a copy of your data</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your data</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at support@captur.academy
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Changes are effective when posted.
            </p>
          </section>

          {/* Chrome Web Store Data Disclosure */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Chrome Web Store Data Usage Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Limited Use Policy Compliance:</strong> The use of information received from Google APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Minimum Permissions:</strong> Captur requests only the minimum permissions necessary for its single purpose of vocabulary capture and learning.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li><strong>Email:</strong> support@captur.academy</li>
              <li><strong>Website:</strong> <a href="https://www.captur.academy" className="text-primary hover:underline">https://www.captur.academy</a></li>
            </ul>
          </section>

          {/* Summary */}
          <section className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>In Plain English:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>We only see text you explicitly save or when you click "Key Takeaways" or AI writing buttons</li>
                <li>AI features (Key Takeaways, rephrase, translate) send text to OpenAI only when you click those buttons</li>
                <li>We don't track your browsing or collect personal information</li>
                <li>We don't sell or share your data with anyone for advertising or marketing</li>
                <li>We only use your data to help you learn vocabulary and provide AI assistance</li>
                <li>OpenAI doesn't store your data for training (per API terms)</li>
                <li>You can delete your data anytime</li>
                <li>We use secure HTTPS for all data transmission</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-16">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Captur. All rights reserved.</p>
            <p className="mt-2">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              {" · "}
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
              {" · "}
              <a href="mailto:support@captur.academy" className="hover:text-primary transition-colors">Contact</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

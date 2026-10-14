# Contributing / Katkı

Discuss scope in an issue, without tokens, personal data or private server messages. Keep changes focused and easy to review. Unit changes need an official definition source, independent known-value tests and boundary cases. Keep private preview/explicit share, permissions, TTLs, hard memory limits and mention suppression intact. Do not add privileged intents or new data retention without a clear need and documentation.

Kapsamı issue içinde görüşün; token, kişisel veri veya özel sunucu mesajı paylaşmayın. Birim değişikliklerine resmî kaynak, bağımsız bilinen değer testleri ve sınır testleri ekleyin. Özel önizleme, açık paylaşım onayı, izinler, süre/bellek sınırları ve mention engelini koruyun. Yeni veri tutmayı veya ayrıcalıklı intents kullanımını gerekçe ve belge olmadan eklemeyin.

Use Node 24. Run `npm ci --ignore-scripts`, `npm run check`, `npm audit --audit-level=low`, and `git diff --check`. Format with `npx biome check --write .`. Do not commit `.env`, node_modules or dist. Use short, concrete commit titles describing the change. Include validation and limitations in your pull request. Automated mocks do not establish live Discord compatibility or accessibility; test those separately in a server you control with your own credentials.

Node 24 kullanın. Yukarıdaki kontrolleri çalıştırın; `.env`, node_modules veya dist göndermeyin. Kısa ve somut commit başlıkları yazın; PR'da doğrulamayı ve sınırları açıklayın. Canlı Discord ve erişilebilirlik kontrollerini kendi sunucunuzda ayrıca yapın.

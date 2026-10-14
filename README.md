# MeasureMoss

[Türkçe](#türkçe) · [English](#english) · [MIT license](LICENSE)

## Türkçe

### Amaç ve özellikler

MeasureMoss, uluslararası hobi, el işi ve yemek topluluklarının ölçüleri daha kolay anlaması için Discord sunucusunda çalışan gerçek bir bottur. `/measure` komutu önce yalnızca komutu kullanan kişiye sonucu gösterir. **Share here / Burada paylaş** düğmesiyle aynı kanalda paylaşabilirsiniz; **Discard / Vazgeç** paylaşmadan kapatır. Sonuçlar sade metindir, renk veya görsel okumayı gerektirmez. Ekran okuyucu ve mobil deneyimi canlı ortamda ayrıca denenmelidir.

- Uzunluk: mm, cm, m, km, uluslararası inç, fit, yarda ve mil.
- Kütle: mg, g, kg, avoirdupois ons ve libre. Ons sıvı onsu veya troy onsu değildir; libre kuvvet birimi değildir.
- Sıcaklık: Celsius, Fahrenheit, Kelvin. Formüller mutlak sıcaklık içindir; sıcaklık **farkı** için kullanılmaz.
- Birimler listeden seçilir; farklı türler arasında dönüşüm, negatif uzunluk/kütle ve mutlak sıfır altı sıcaklık reddedilir.
- Onay tek kullanımlık, kullanıcı/sunucu/kanal/önizleme mesajına bağlıdır. Bot, komut ve paylaşım sırasında her iki tarafın kanal izinlerini kontrol eder.
- Her kullanıcı 5 saniyede bir hesaplama, her kanal dakikada bir paylaşım yapabilir. Önizlemeler 5 dakika geçerlidir; en fazla 100 önizleme ve her hız sınırı haritasında 500 kayıt tutulur.

### Yapmadıkları ve sınırlar

Mesajlarınızı okumaz, üye geçmişi tutmaz, DM göndermez, ses kanalına girmez ve internetten tarif/bilgi çekmez. Moderasyon, ticket, takvim, tarif uyarlama, hacim-kütle dönüşümü, yoğunluk tahmini veya tıbbi doz hesabı yapmaz. İşletmecinin çalıştırdığı tek bir süreç ve kendi Discord uygulaması gerekir; bu depo barındırılan bir hizmet veya hazır bot daveti değildir. Bot yalnızca ayarlanan **bir sunucuda**, normal metin ve duyuru kanallarında çalışır; DM, forum, thread ve ses kanalı sohbetleri desteklenmez. Duyuru kanalına mesaj gönderir; Discord'un duyuru yayımlama/crosspost işlemini yapmaz.

Girdi en fazla bir milyar mutlak değere ve 9 ondalık basamağa sahip olabilir. `12.5` ve `12,5` aynı ondalıktır. Nokta/virgül **asla binlik ayırıcı değildir**: `1,000`, bir anlamına gelir. Bin için `1000` yazın. Boşluk, artı işareti, baştaki gereksiz sıfır, karışık ayırıcı ve üs biçimi (`1e3`) kabul edilmez; `0.5` yazın, `.5` yazmayın. Sonuçlarda nokta ondalık ayırıcıdır; `1e-15`, 10'un eksi 15'inci kuvvetidir. Sonuç yaklaşık 10 anlamlı basamakla gösterilir; son sıfırlar atılır. Bu gösterim, ölçümünüzün o hassasiyette olduğunu söylemez. İç dönüşümler tamsayı kesirlerle yapılır, yalnızca gösterimde kayan nokta/yuvarlama kullanılır. Aynı birime dönüşüm de desteklenir. `≈` işareti yaklaşık gösterimi belirtir.

### Gereksinimler

Node.js **24 LTS** ve onunla gelen npm, internet erişimi, Discord hesabı ve bot ekleyebildiğiniz bir sunucu gerekir. Node 26 bu projenin desteklenen çalışma ortamı değildir. [Node.js resmî sitesinden](https://nodejs.org/en/download) 24 sürümünü kurun. Git isteğe bağlıdır. Bilgisayar veya sunucu açık ve internete bağlı kalmalıdır. Token gerekmeden testler çalışır; gerçek sunucu kurulumu için kendi tokenınız şarttır.

### Baştan sona kurulum

1. Bu deponun **Code → Download ZIP** seçeneğini kullanın ve ZIP'i normal bir klasöre çıkarın. ZIP içinden çalıştırmayın. Alternatif: `git clone https://github.com/euglado/measuremoss.git`.
2. [Discord Developer Portal](https://discord.com/developers/applications) içinde **New Application** ile size ait bir uygulama oluşturun. **General Information** sayfasından **Application ID** değerini alın. **Bot** bölümünde bot kullanıcı oluşturun/görüntüleyin, **Reset Token** ile token alın. Tokenı parola gibi koruyun; sohbet, ekran görüntüsü veya GitHub issue içine koymayın. **Public Bot** ayarı bu kaynak deponun public olmasından bağımsızdır; yalnızca kendi sunucunuzda kullanmak istiyorsanız kapalı bırakabilirsiniz.
3. **Bot → Privileged Gateway Intents** bölümündeki Message Content, Server Members ve Presence izinlerini kapalı bırakın. Bot yalnızca ayrıcalıklı olmayan Guilds intentini kullanır.
4. **Installation** bölümünde **Guild Install** (sunucu kurulumu) seçin. Kapsamlar `bot` ve `applications.commands`; bot izinleri yalnızca **View Channels** ve **Send Messages** (3072). User Install gerekli değildir. Interactions Endpoint URL girmeyin: bağlantı Gateway üzerindendir. Yönetici izni vermeyin.
5. Discord **User Settings → Advanced → Developer Mode** açın. Sunucunun simgesine sağ tıklayıp **Copy Server ID** alın. Bu değer kanal kimliği değildir.
6. Windows'ta klasördeki **setup.cmd** dosyasını çift tıklayın. macOS/Linux'ta bu klasörde terminal açın; `chmod +x setup.sh start.sh`, ardından `./setup.sh` çalıştırın. macOS'ta güvenlik politikası indirdiğiniz dosyayı engelliyorsa içeriğini kontrol ederek terminalden `bash setup.sh` kullanabilirsiniz. Bu yardımcılar kilitli bağımlılıkları kurar ve kodu derler; uygulama ve sunucu kimliklerini, ardından **görünmeden** tokenı sorar. Token yapıştırırken karakter/yıldız görünmemesi normaldir; Enter'a basın. Token için Ctrl+C kurulumu iptal eder. Kaynak kod değiştirilmez.
7. Yardımcının verdiği tıklanabilir Discord bağlantısını açın, doğru sunucuyu seçip izinleri inceleyerek onaylayın. Botun sunucuya eklendiğinden emin olduktan sonra yardımcıdaki Enter/tuş adımını geçin. `/measure` yalnızca bu sunucuya kaydedilir; diğer uygulama komutları silinmez. Bot çevrimdışı görünürse sonraki adımı uygulayın.
8. Windows'ta **start.cmd**, macOS/Linux'ta **./start.sh** (`bash start.sh` da olur) çalıştırın. `MeasureMoss ready / hazır` çıktısını bekleyin. Terminal açık kaldığı sürece bot çalışır. Ctrl+C ile durdurabilirsiniz.

Elle terminal kullanmayı tercih ederseniz sırayla `npm ci --ignore-scripts`, `npm run build`, `npm run setup`, davet bağlantısından kurulum, `npm run register`, `npm start` çalıştırın. Komutları proje klasöründe çalıştırın. Yardımcılar ilk hatada durur. Bunları yeniden kurulum için çalıştırmadan önce mevcut `.env` dosyanızı gizli bir yere taşıyın; araç dosyanın üzerine yazmaz.

### Yapılandırma ve sürekli çalışma

Yardımcı, `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID` ve `DISCORD_GUILD_ID` alanlarını yerel `.env` dosyasına yazar. Değerleri kaynak dosyalara yazmayın. Dosya Git tarafından dışlanır; şifreli değildir. macOS/Linux'ta oluşturma modu 0600'dür; Windows'ta klasör erişimini kendi hesabınızla sınırlayın. `.env.example` yalnızca boş alanları gösterir; onu gerçek tokenla Git'e göndermeyin. Token değiştirirseniz botu durdurun, eski `.env` dosyasını güvenli bir yere taşıyın ve kurulumu yeniden yapın; eski tokenı Portal'da iptal edin. Sunucu değişiminde eski sunucudaki komutu Portal/Discord entegrasyonundan kaldırabilirsiniz; bot eski sunucudaki istekleri reddeder.

Ev bilgisayarı uyuduğunda bot kapanır. Sürekli çalışma için Node 24 destekleyen güvenilir bir host üzerinde kaynakları ve özel `.env` dosyasını ayrı ayrı kurun; `npm ci --ignore-scripts`, `npm run build`, `npm start` kullanın. Hostun işlem yöneticisinde çalışma klasörünü doğru belirleyin ve yeniden başlatmayı etkinleştirin. Aynı tokenla **tek süreç** çalıştırın: hız sınırları ve tek kullanımlık onaylar süreç içindedir, birden çok kopya desteklenmez. Botun GitHub Actions iş akışı botu barındırmaz. Discord'a bağlanmak için dışarı HTTPS/WebSocket bağlantısı gerekir; inbound port veya HTTP sunucusu gerekmez.

### Kullanım

Discord'da `/measure` yazın, `value` alanına `12.5`, `from` için inç (`in`), `to` için santimetre (`cm`) seçin. `12.5 in ≈ 31.75 cm` özel sonucu gelir. Paylaşmak isteğe bağlıdır; paylaşımda adınız veya mention yer almaz, ancak bunu anonimlik garantisi olarak görmeyin. **Burada paylaş**, sonucu komutun çalıştırıldığı kanala gönderir. Başka kanala göndermek için o kanalda yeni komut kullanın. **Vazgeç**, geçici kaydı siler; özel Discord yanıtı kalabilir. Başka örnekler: `2,5 kg → g`, `32 f → c`, `1 mi → km`. Birimler Discord'un seçim listesinden seçilir.

Sunucu yöneticileri **Server Settings → Integrations → MeasureMoss** üzerinden komutun hangi roller/kanallar tarafından kullanılacağını sınırlandırabilir. Üyenin de botun da Kanalı Görüntüle ve Mesaj Gönder izinleri bulunmalıdır. Önizleme süresi dolduğunda bot yeniden başlatılınca eski düğmeler çalışmaz; yeni komut verin. Paylaşım hatasında otomatik tekrar yapılmaz: önce kanalı kontrol edin, gönderilmiş olabilir. Aynı düğmeye tekrar basmak ikinci kopyayı üretmez.

### İzinler, güvenlik ve gizlilik

Yalnızca `Guilds` Gateway intenti, `bot` + `applications.commands` OAuth kapsamları ve 3072 kanal izinleri gerekir. Mesaj geçmişi okuma, Embed Links, Attach Files, Manage Messages, Manage Roles, Administrator ve ayrıcalıklı intents istenmez. Kullanıcı/sunucu/kanal/önizleme mesajı kimlikleri ve sonuç, önizleme için RAM'de 5 dakika tutulur. Kullanıcı kimlikleri 5 saniyelik, kanal kimlikleri 60 saniyelik hız sınırında tutulur. Süresi dolan kayıtlar etkileşimde veya dakikalık temizleyicide kaldırılır; durdurma/restart RAM'i kaybettirir. Paylaşım veya vazgeçme önizleme kaydını siler. Veritabanı, telemetri, analiz veya dönüşüm geçmişi yoktur. Loglara token, hesaplama içeriği ve ham Discord hata nesnesi yazılmaz.

**Özel/ephemeral, uçtan uca şifreleme değildir.** Discord ve çalıştıran kişi altyapı üzerinden verileri işleyebilir; Discord'un özel yanıtları ve paylaşılan mesajlar bot belleği silindikten sonra kalabilir. Hassas veri girmeyin. Bot paylaşılan mesajları sonradan izlemez, silmez veya geri çekmez. Normal Discord yetkileriyle manuel silebilirsiniz. Mention ve otomatik embedler bastırılır. Paylaşım izin kontrolü ve hız sınırı, platform izinlerinin yerini almaz. Sonuçlar genel topluluk iletişimi içindir; güvenlik açısından kritik ölçümlerde bağımsız doğrulama yapın. Token sızarsa Developer Portal'da sıfırlayın; sadece Git geçmişinden silmek yeterli değildir.

### Sorun giderme

- **node/npm bulunamadı:** Node 24'ü kurun, terminali yeniden açın; `node --version` ile kontrol edin.
- **.env zaten var:** Araç güvenli biçimde durur. Dosyanın yedeğini gizli tutun; yeniden kurmadan önce taşıyın. Tokenı buraya/issue'a göndermeyin.
- **Token alanında hiçbir şey görünmüyor:** Gizli giriş davranışıdır; bir kez yapıştırıp Enter'a basın. Terminal gerekli, pipe/CI girişi kabul edilmez.
- **Komut görünmüyor:** Doğru uygulama ve sunucu kimliklerini, sunucu kurulumunu ve `applications.commands` kapsamını kontrol edin; `npm run register` tekrar çalıştırın. Discord'u yenileyin. Rolün **Use Application Commands** iznini ve entegrasyon kısıtlarını kontrol edin.
- **Bot offline/istek yanıt vermedi:** `npm start` sürecinin açık olduğunu, Node 24, internet ve tokenı kontrol edin. Ayrıcalıklı intents açmanız gerekmez. İzinleri Administrator ile çözmeye çalışmayın.
- **Kanal/izin hatası:** Normal metin veya duyuru kanalı kullanın; üye ve bot için View Channel + Send Messages izinlerini kanal override'ları dahil kontrol edin. Thread/forum desteklenmez.
- **Birimler aynı türde değil:** Kütleyi kütleye, uzunluğu uzunluğa dönüştürün. Bardak → gram gibi dönüşümler bilinçli olarak yoktur.
- **Sayı geçersiz/sonuç beklenmedik:** `1,000` bir demektir; bin için `1000` yazın. En fazla 9 ondalık basamak, bir milyar mutlak değer; ayırıcıları karıştırmayın.
- **Önizleme dolmuş/yoğun:** Yeni `/measure` çalıştırın, 5 saniye veya paylaşım için 60 saniye bekleyin. Önizleme 5 dakika geçerlidir. Restart eski düğmeleri geçersiz kılar.
- **Paylaşım hatası:** Önce kanalı kontrol edin. Ağ yanıtı kaybolmuşsa gönderi oluşmuş olabilir; tüketilen onay yeniden göndermez. Gerekirse yeni komut kullanın.

### Testler, katkı ve lisans

`npm ci --ignore-scripts`, `npm run check` ve `npm audit --audit-level=low` çalıştırın. Check: Biome önerilen kurallar/biçim, strict TypeScript, Node testleri ve bağımlılık lisans/kaynak/SHA-512/install-script + kaynak gizli bilgi kalıp taraması. Gizli bilgi taraması bir garanti değildir. GitHub Actions aynı kontrolleri Ubuntu, Windows ve macOS 15 Intel üzerinde, salt okunur repo izinleriyle çalıştırır; token veya canlı Discord sunucusu gerekmez. Testler matematik, sınırlar, izinler, bağlam sahteciliği, yarışan tıklamalar, API hataları, hız/bellek sınırları ve güvenli yapılandırmasız çıkışları kapsar. Etkileşimler mock'tur. Gerçek Discord kurulumu, token girişinin etkileşimli kullanımı, ekran okuyucu ve mobil deneyimi işletmecinin ayrı doğrulamasını gerektirir. VDS veya canlı token test sırasında kullanılmadı.

Yeni birim veya hata düzeltmesi için [CONTRIBUTING.md](CONTRIBUTING.md), güvenlik bildirimleri için [SECURITY.md](SECURITY.md) okuyun. Katkılarda birim tanımını resmî kaynağa bağlayın ve sınır testleri ekleyin. Proje [MIT](LICENSE) lisanslıdır; bağımlılıkların kendi lisansları vardır. Kullanım Discord kurallarına tabidir. Tanım kaynakları: [NIST dönüşüm faktörleri](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8), [NIST sıcaklık dönüşümleri](https://www.nist.gov/pml/owm/metric-si/unit-conversion/approximate-conversions-us-customary-measures-metric). Uluslararası inç tam 0.0254 m, libre tam 0.45359237 kg, ons librenin 1/16'sıdır; survey foot/troy ölçüleri kullanılmaz.

## English

### Purpose and features

MeasureMoss is a real Discord bot that makes measurements easier to understand in international maker, craft and cooking communities. `/measure` shows a result privately first. **Share here / Burada paylaş** explicitly posts it in that channel; **Discard / Vazgeç** closes without sharing. Responses are plain text and do not depend on images or color. Screen-reader and mobile behavior still need live operator validation.

- Length: mm, cm, m, km, international inch, foot, yard and mile.
- Mass: mg, g, kg, avoirdupois ounce and pound. No fluid/troy ounces or pound-force.
- Temperature: Celsius, Fahrenheit and Kelvin; absolute temperatures, not temperature differences.
- Choice lists, family validation, nonnegative length/mass and absolute-zero validation.
- Single-use sharing bound to owner, server, channel and preview message; channel permissions checked at command and share time.
- One conversion per user every 5 seconds; one share per channel per minute; 5-minute previews. Hard limits: 100 previews, 500 entries per cooldown map.

### Scope and limitations

No message reading, member history, DMs, voice access, external content fetching, moderation, ticketing, recipe scaling, volume-to-mass estimates or medical dosing. This repository is source code, not a hosted service or an invitation to an existing bot. You need your own Discord application and **one running process**. One configured server; ordinary text and announcement channels only. No DM, forum, thread or voice-channel chat support. Posting in an announcement channel does not publish/crosspost the announcement.

Inputs may have up to 9 decimal places and an absolute value of one billion. Both `12.5` and `12,5` mean twelve and a half. A separator is **always decimal, never grouping**: `1,000` means one; write `1000` for a thousand. No spaces, plus signs, redundant leading zeros, mixed separators or exponent inputs (`1e3`). Use `0.5`, not `.5`. Output uses a decimal point and may use scientific notation: `1e-15` means ten to the negative fifteenth power. Results are displayed to approximately 10 significant digits with trailing zeros removed; this does not imply measurement precision. Integer fractions are used internally and floating-point rounding only for display. Same-unit conversions are allowed; `≈` identifies the approximate display.

### Requirements

Install **Node.js 24 LTS** and bundled npm from [nodejs.org](https://nodejs.org/en/download). Node 26 is outside the supported runtime range. You also need internet access, a Discord account and a server where you can install a bot. Git is optional. Tests do not require a token; live operation does. Your computer or host must stay awake and online.

### Installation, from download to first command

1. Use **Code → Download ZIP** in this repository, then extract into an ordinary folder. Do not run inside the ZIP. Alternatively, `git clone https://github.com/euglado/measuremoss.git`.
2. Open the [Discord Developer Portal](https://discord.com/developers/applications), select **New Application**, and create your own app. Copy the **Application ID** from General Information. In **Bot**, create/view the bot user and use **Reset Token** to obtain a token. Treat it as a password: never send it in chat, screenshots or issues. The app's Public Bot setting is separate from this repository's public visibility; keep it off if only you should install your instance.
3. Leave all **Privileged Gateway Intents** off: Message Content, Server Members and Presence. Only the nonprivileged Guilds intent is used.
4. Under **Installation**, enable **Guild Install** with scopes `bot` and `applications.commands`, and only **View Channels** and **Send Messages** permissions (3072). User Install is unnecessary. Leave Interactions Endpoint URL empty: the bot uses Gateway. Do not grant Administrator.
5. In Discord, enable **User Settings → Advanced → Developer Mode**. Right-click your server icon and **Copy Server ID**, not a channel ID.
6. On Windows, double-click **setup.cmd**. On macOS/Linux, open a terminal in this folder, run `chmod +x setup.sh start.sh`, then `./setup.sh`. If local execution policy blocks a downloaded script, inspect it and run `bash setup.sh` from your terminal. The helper installs locked packages, builds, asks for application/server IDs, then asks for the token with **hidden input**. No characters or stars appearing when pasting is normal; press Enter. Ctrl+C at the token prompt cancels setup. No source edits are required.
7. Open the clickable Discord invitation printed by setup. Check the selected server and permissions and authorize it. Once the bot is installed, continue the helper's key/Enter prompt to register `/measure` in that server. Registration preserves other application commands. The bot may look offline until the next step.
8. Run **start.cmd** on Windows or **./start.sh** (also `bash start.sh`) on macOS/Linux. Wait for `MeasureMoss ready / hazır`. Keep the terminal open; Ctrl+C stops the bot.

For manual terminal installation, run `npm ci --ignore-scripts`, `npm run build`, `npm run setup`, install using the invitation, then `npm run register` and `npm start`, all inside the project folder. Helpers stop on the first error. They refuse to overwrite an existing `.env`; move the old file somewhere private before running setup again.

### Configuration and keeping the bot online

Setup creates a local `.env` with `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID` and `DISCORD_GUILD_ID`. Never put these values into source files. Git ignores `.env`; the file is **not encrypted**. Creation mode is 0600 on macOS/Linux; restrict folder access to your account on Windows. `.env.example` contains empty placeholders only. For token rotation, stop the bot, move the old `.env` privately, reset/revoke the old token in the Portal and rerun setup. If you change servers, remove the old server's command through the Discord integration settings; the running bot rejects old-server interactions.

Sleeping computers stop the bot. For continuous operation, use a trusted host with Node 24, install sources and private configuration separately, and run `npm ci --ignore-scripts`, `npm run build`, `npm start`. Set the correct working directory and automatic restarts in your host's process manager. Run only **one process per token**; cooldowns and single-use previews are process-local and multiple replicas are unsupported. GitHub Actions runs checks, not the bot. Outbound HTTPS/WebSocket access is required; no inbound port or HTTP server is needed.

### Usage

Type `/measure`, set `value` to `12.5`, `from` to international inch (`in`) and `to` to centimeter (`cm`). The private result is `12.5 in ≈ 31.75 cm`. Sharing is optional and does not include your name or a mention, but it is not an anonymity guarantee. **Share here** posts in the command's channel; to use another channel, run a new command there. **Discard** removes the temporary record, although Discord's private response can remain. Other examples: `2,5 kg → g`, `32 f → c`, `1 mi → km`. Pick units from Discord's lists.

Server managers can restrict command roles/channels through **Server Settings → Integrations → MeasureMoss**. Both the member and the bot require View Channel and Send Messages. Expired or pre-restart previews cannot be reused. Sharing failures are never retried automatically: inspect the channel first because a message may already have been sent. Repeated clicks cannot resend the same preview.

### Permissions, security and privacy

Only Guilds intent, `bot` + `applications.commands` scopes, and channel permissions 3072 are needed. No Read Message History, Embed Links, Attach Files, Manage Messages, Manage Roles, Administrator or privileged intents. Preview RAM stores owner/server/channel/message IDs and the computed result for 5 minutes. User IDs are retained for 5-second cooldowns and channel IDs for 60-second cooldowns. Expired records are removed on an interaction or the minute cleanup timer; stopping/restarting loses RAM. Sharing/discarding removes the preview record. No database, analytics, telemetry or conversion history. Logs do not include tokens, input/result content or raw Discord exceptions.

**Ephemeral is not end-to-end encryption.** Discord and the operator's infrastructure can process data; Discord replies and shared messages can remain after bot memory is cleared. Avoid sensitive inputs. The bot does not subsequently track, delete or retract shared messages; remove them manually with normal Discord permissions. Mentions and automatic embeds are suppressed. Permission checks and cooldowns supplement platform permissions. Independently validate safety-critical measurements. If a token leaks, reset it in the Portal; removing it from Git history alone is insufficient.

### Troubleshooting

- **node/npm missing:** Install Node 24, reopen your terminal and check `node --version`.
- **Existing .env:** Setup stops safely. Keep any backup private and move it before rerunning. Never attach it to an issue.
- **Token prompt looks blank:** Input is intentionally hidden; paste once and press Enter. An interactive terminal is required, not a pipe or CI job.
- **Command missing:** Check application/server IDs, Guild Install, `applications.commands`, rerun `npm run register`, and refresh Discord. Check the member's Use Application Commands permission and integration restrictions.
- **Offline/no response:** Keep `npm start` running; check Node 24, internet and token. Do not enable privileged intents or Administrator as a workaround.
- **Channel/permission error:** Use an ordinary text/announcement channel. Check both member and bot View Channel + Send Messages, including channel overrides. No thread/forum support.
- **Mismatched units:** Select the same family. Cups to grams is intentionally unsupported.
- **Invalid/unexpected number:** `1,000` is one, not a thousand. Use up to 9 decimal places, absolute value at most one billion, and a single decimal separator.
- **Expired/busy preview:** Run `/measure` again; wait 5 seconds between calculations or 60 seconds for channel sharing. Previews expire after 5 minutes and become invalid on restart.
- **Share error:** Inspect the channel before trying a new command. A lost network response can hide a successful post; a consumed preview will never resend.

### Tests, contributing and license

Run `npm ci --ignore-scripts`, `npm run check`, `npm audit --audit-level=low`. Check runs Biome recommended lint/format, strict TypeScript, Node tests, dependency license/registry/SHA-512/install-script checks and source credential-pattern scans. Pattern scans are not a guarantee. Read-only, SHA-pinned GitHub Actions performs the same checks on Ubuntu, Windows and macOS 15 Intel without a token/server. Tests cover conversions, bounds, permissions, context forgery, concurrent clicks, API failures, cooldown/memory limits and safe unconfigured exits. Discord interactions are mocked. Live installation, interactive hidden-token entry, mobile and screen-reader experience require separate operator validation. No VDS or live token was used for development tests.

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before contributing. Cite official unit definitions and add boundary tests. [MIT](LICENSE) covers this project; dependencies retain their own licenses. Discord platform rules still apply. Definitions: [NIST conversion factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8), [NIST temperature formulas](https://www.nist.gov/pml/owm/metric-si/unit-conversion/approximate-conversions-us-customary-measures-metric). International inch is exactly 0.0254 m; avoirdupois pound is exactly 0.45359237 kg; ounce is 1/16 pound. No survey-foot or troy definitions.

# Security / Güvenlik

Supported version / Desteklenen sürüm: current main, Node 24.

Do not disclose vulnerabilities with tokens or private data in public issues. Use this repository's GitHub **Security → Report a vulnerability** option when available. If unavailable, open a minimal issue requesting a private reporting channel without exploit details or secrets. There is no promised response time. Rotate exposed bot tokens immediately through the Developer Portal.

Açıkları token veya özel verilerle public issue içinde bildirmeyin. Varsa GitHub **Security → Report a vulnerability** seçeneğini kullanın. Yoksa istismar ayrıntısı/gizli bilgi vermeden özel bildirim kanalı isteyen kısa bir issue açın. Yanıt süresi garantisi yoktur. Açığa çıkan bot tokenını Portal'dan hemen sıfırlayın.

Data is process-local and not encrypted. Discord responses can outlive previews. Single-process rate limiting does not prevent all abuse; server managers should limit command channels/roles. Dependency/credential scans reduce risk but cannot prove absence of vulnerabilities or secrets. No privileged intents, message reading or external URL requests are needed.

Veri süreç belleğindedir ve şifreli değildir. Discord yanıtları önizlemelerden uzun yaşayabilir. Sunucu yöneticileri komutu kanal/rollerle kısıtlayabilir. Taramalar tüm güvenlik sorunlarının veya gizli bilgilerin yokluğunu kanıtlamaz.

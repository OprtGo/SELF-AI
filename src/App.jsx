import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import toolsData from './self-ai_data.json';

/* ═══════════════════════════════════════════════════════════
   SELF-AI — AI Tools Archive
   Color Palette:
   BLUE:    #B9C7D6, #9FB6CF
   PINK:    #D7A6A3, #E2B8B6
   GREEN:   #AFC6B4, #C7D7CC
   NEUTRAL: #E5E4E1, #CFCFD4, #B7B8BF
   ═══════════════════════════════════════════════════════════ */

// ─── GLOSSARY (Sözlük) ─────────────────────────────────────
const GLOSSARY = {
  "Agent": {
    short: "AI Agent",
    tr: "Yapay Zeka Ajanı",
    desc: "Otonom karar alabilen, araçları kullanabilen ve çok adımlı görevleri kendi başına tamamlayabilen AI sistemleri.",
    example: "Bir AI agent'a 'bana uçak bileti bul ve rezervasyon yap' dersiniz. Agent arama yapar, karşılaştırır, seçenekleri sunar ve onayınızla tamamlar.",
    related: ["MCP", "Tool Use", "Autonomous"]
  },
  "API": {
    short: "Application Programming Interface",
    tr: "Uygulama Programlama Arayüzü",
    desc: "Yazılımların birbiriyle iletişim kurmasını sağlayan arayüz. AI araçlarının çoğu API üzerinden erişilebilir.",
    example: "OpenAI API'sine bir istek gönderirsiniz, GPT modeli yanıt üretir ve size geri döner. Kendi uygulamanızda ChatGPT'nin zekasını kullanmış olursunuz.",
    related: ["REST", "Endpoint", "SDK"]
  },
  "Attention": {
    short: "Attention Mechanism",
    tr: "Dikkat Mekanizması",
    desc: "Transformer mimarisinin temel bileşeni. Modelin bir cümledeki her kelimenin diğer kelimelerle ilişkisini öğrenmesini sağlar.",
    example: "'Kedi süt içti çünkü o acıkmıştı' cümlesinde attention mekanizması 'o' zamirinin 'kedi'ye referans verdiğini anlar.",
    related: ["Transformer", "Self-Attention", "LLM"]
  },
  "Autonomous": {
    short: "Otonom Sistem",
    tr: "Otonom / Bağımsız Çalışan",
    desc: "İnsan müdahalesi olmadan kendi başına karar alıp görev tamamlayabilen sistemler.",
    example: "Otonom bir kodlama agent'ı, bir hata raporu alır, kodu inceler, düzeltmeyi yazar, test eder ve PR açar — tek başına.",
    related: ["Agent", "Agentic", "Multi-Agent"]
  },
  "Benchmark": {
    short: "Performans Ölçütü",
    tr: "Kıyaslama Testi",
    desc: "AI modellerinin performansını standart testlerle karşılaştırma yöntemi.",
    example: "MMLU, HumanEval, GSM8K gibi benchmark'lar modellerin matematik, kodlama ve genel bilgi yeteneklerini ölçer.",
    related: ["Evaluation", "Leaderboard", "MMLU"]
  },
  "Chain of Thought": {
    short: "CoT Reasoning",
    tr: "Düşünce Zinciri",
    desc: "Modelin adım adım düşünerek daha doğru sonuçlara ulaşmasını sağlayan prompting tekniği.",
    example: "'Adım adım düşün' dediğinizde model '1. önce şunu hesaplayayım, 2. sonra bunu...' şeklinde ilerler ve hata oranı düşer.",
    related: ["Prompt Engineering", "Reasoning", "LLM"]
  },
  "Chatbot": {
    short: "Sohbet Robotu",
    tr: "Sohbet Botu",
    desc: "Kullanıcılarla doğal dilde metin veya ses üzerinden etkileşim kurabilen yazılım.",
    example: "Bir e-ticaret sitesindeki 'Size nasıl yardımcı olabilirim?' penceresi genellikle bir chatbot'tur. AI destekli olanları gerçek soruları anlayıp cevaplar.",
    related: ["LLM", "NLP", "Conversational AI"]
  },
  "CI/CD": {
    short: "Continuous Integration / Delivery",
    tr: "Sürekli Entegrasyon / Dağıtım",
    desc: "Kod değişikliklerinin otomatik test edilip, otomatik olarak canlı ortama aktarılması süreci.",
    example: "GitHub'a kod push ettiğinizde otomatik testler çalışır, geçerse uygulama otomatik güncellenir. Bu CI/CD pipeline'dır.",
    related: ["Docker", "Git", "DevOps"]
  },
  "CLI": {
    short: "Command Line Interface",
    tr: "Komut Satırı Arayüzü",
    desc: "Grafiksel arayüz yerine metin komutlarıyla çalışan araçlar.",
    example: "Terminal'de 'git push' veya 'npm install' yazmak CLI kullanmaktır. Birçok AI aracı da CLI üzerinden çalışır.",
    related: ["Terminal", "Shell", "Bash"]
  },
  "Computer Vision": {
    short: "Bilgisayarla Görü",
    tr: "Bilgisayarla Görme",
    desc: "Bilgisayarların görüntüleri ve videoları anlama, yorumlama yeteneği.",
    example: "Telefonunuzun yüz tanıma ile kilidini açması, Google Lens'in bir çiçeğin türünü tanıması — hepsi computer vision.",
    related: ["OCR", "Object Detection", "Image Recognition"]
  },
  "Context Window": {
    short: "Bağlam Penceresi",
    tr: "Bağlam Penceresi / Kapasitesi",
    desc: "Bir LLM'in tek seferde işleyebildiği maksimum metin miktarı (token sayısı).",
    example: "GPT-4o'nun 128K context window'u var — yaklaşık 300 sayfalık bir kitabı tek seferde okuyabilir. Claude'un 200K token kapasitesi var.",
    related: ["Token", "LLM", "Memory"]
  },
  "CUDA": {
    short: "GPU Computing Platform",
    tr: "GPU Hesaplama Platformu",
    desc: "NVIDIA'nın GPU'lar üzerinde genel hesaplama yapmayı sağlayan platformu. AI model eğitiminin temel altyapısı.",
    example: "Bir modeli eğitirken 'CUDA out of memory' hatası alırsanız, GPU belleği yetmiyordur. Daha küçük batch size deneyin.",
    related: ["GPU", "NVIDIA", "Training"]
  },
  "Dataset": {
    short: "Veri Seti",
    tr: "Veri Kümesi",
    desc: "AI modellerini eğitmek veya test etmek için kullanılan yapılandırılmış veri koleksiyonu.",
    example: "ImageNet milyonlarca etiketlenmiş fotoğraf içeren bir dataset'tir. Hugging Face'te binlerce ücretsiz dataset bulabilirsiniz.",
    related: ["Training", "Labeling", "Hugging Face"]
  },
  "Deep Learning": {
    short: "Derin Öğrenme",
    tr: "Derin Öğrenme",
    desc: "Çok katmanlı yapay sinir ağları kullanan makine öğrenmesi alt dalı. Modern AI'ın temelini oluşturur.",
    example: "Yüz tanıma, ses tanıma, makine çevirisi — bunların hepsi deep learning ile çalışır. 'Deep' çok katmanlı ağ yapısını ifade eder.",
    related: ["Neural Network", "Machine Learning", "GPU"]
  },
  "Diffusion Model": {
    short: "Yayılım Modeli",
    tr: "Difüzyon / Yayılım Modeli",
    desc: "Gürültüden başlayarak adım adım görüntü üreten generatif AI modelleri. Stable Diffusion, DALL-E, Midjourney bu tekniği kullanır.",
    example: "'Bir astronotun atla Mars'ta yürüyüşü' yazdığınızda model rastgele gürültüden başlayıp adım adım bu sahneyi oluşturur.",
    related: ["Stable Diffusion", "Image Generation", "FLUX"]
  },
  "Docker": {
    short: "Container Platform",
    tr: "Konteyner Platformu",
    desc: "Uygulamaları ve tüm bağımlılıklarını izole 'konteyner'larda çalıştırmayı sağlayan platform.",
    example: "Bir AI uygulamasını Docker'a koyarsınız, herhangi bir bilgisayarda 'docker run' deyince birebir aynı şekilde çalışır — kurulum derdi yok.",
    related: ["Container", "Kubernetes", "DevOps"]
  },
  "Embedding": {
    short: "Vektör Temsili",
    tr: "Gömme / Vektörleştirme",
    desc: "Metin, görsel veya ses gibi verileri sayısal vektörlere dönüştürme işlemi. Anlamsal benzerlik aramalarının temelidir.",
    example: "'Kedi' ve 'pisi' kelimeleri embedding'de birbirine yakın vektörlerdir. Bu sayede arama motorları anlam eşleşmesi yapabilir.",
    related: ["RAG", "Vector Database", "Semantic Search"]
  },
  "Encryption": {
    short: "Şifreleme",
    tr: "Şifreleme / Kriptolama",
    desc: "Verileri okunamaz hale getirerek yetkisiz erişimden koruma yöntemi.",
    example: "WhatsApp mesajlarınız uçtan uca şifreli (E2E encryption). Mesajı sadece siz ve alıcı okuyabilir, WhatsApp bile okuyamaz.",
    related: ["Security", "SSL/TLS", "Hashing"]
  },
  "Endpoint": {
    short: "API Erişim Noktası",
    tr: "Uç Nokta / Erişim Noktası",
    desc: "Bir API'nin belirli bir işlevi sunan URL adresi.",
    example: "api.openai.com/v1/chat/completions bir endpoint'tir. Bu adrese istek atarsınız, model yanıt döner.",
    related: ["API", "REST", "URL"]
  },
  "Fine-tuning": {
    short: "Model İnce Ayarı",
    tr: "İnce Ayar / Özelleştirme",
    desc: "Önceden eğitilmiş bir modeli, kendi verinizle yeniden eğiterek belirli bir göreve özelleştirme işlemi.",
    example: "Müşteri destek botu yapmak istiyorsanız, GPT'yi kendi destek kayıtlarınızla fine-tune edersiniz. Model artık sizin terminolojinizi bilir.",
    related: ["LoRA", "LLM", "Training"]
  },
  "FLUX": {
    short: "Image Generation Model",
    tr: "Görüntü Üretim Modeli",
    desc: "Black Forest Labs tarafından geliştirilen yüksek kaliteli açık kaynak görüntü üretim modeli.",
    example: "FLUX, Stable Diffusion'ın evrimsel bir devamıdır. Özellikle metin içeren görsellerde ve fotorealistik üretimlerde çok başarılı.",
    related: ["Diffusion Model", "Stable Diffusion", "Image Generation"]
  },
  "Git": {
    short: "Version Control System",
    tr: "Versiyon Kontrol Sistemi",
    desc: "Kod değişikliklerini takip eden, ekip çalışmasını kolaylaştıran ve geri dönüş imkanı sağlayan sistem.",
    example: "Kodunuzda bir şeyi bozduğunuzda 'git revert' ile önceki çalışan haline dönebilirsiniz. GitHub, Git'in bulut versiyonudur.",
    related: ["GitHub", "Repository", "Branch"]
  },
  "GPU": {
    short: "Graphics Processing Unit",
    tr: "Grafik İşlem Birimi",
    desc: "Paralel hesaplama yeteneği sayesinde AI model eğitimi ve çıkarımı için kullanılan donanım.",
    example: "Bir LLM eğitmek için NVIDIA A100 veya H100 GPU'lar kullanılır. Tek bir GPU'nun fiyatı 10.000-40.000 dolar arasında olabilir.",
    related: ["CUDA", "NVIDIA", "Training", "VRAM"]
  },
  "Hallucination": {
    short: "Model Halüsinasyonu",
    tr: "Halüsinasyon / Uydurma",
    desc: "AI modelinin gerçek olmayan bilgileri sanki doğruymuş gibi üretmesi.",
    example: "ChatGPT'ye 'X kitabını özetle' dersiniz, kitap gerçekte yoktur ama model inandırıcı bir özet uydurur. Bu bir halüsinasyondur.",
    related: ["LLM", "Grounding", "RAG"]
  },
  "Hugging Face": {
    short: "AI Model Platformu",
    tr: "AI Model ve Veri Seti Platformu",
    desc: "Açık kaynak AI modelleri, veri setleri ve demo'ların paylaşıldığı en büyük topluluk platformu.",
    example: "Hugging Face'te binlerce hazır model var. Bir duygu analizi modeli indirip 5 dakikada projenizde kullanabilirsiniz.",
    related: ["Open Source", "Model Hub", "Transformers"]
  },
  "Inference": {
    short: "Model Çıkarımı",
    tr: "Çıkarım / Tahmin",
    desc: "Eğitilmiş bir modelin yeni veriler üzerinde tahmin yapma süreci.",
    example: "ChatGPT'ye soru sorduğunuzda model inference yapıyor — eğitiminden öğrendiklerini kullanarak yanıt üretiyor.",
    related: ["LLM", "Training", "Latency"]
  },
  "JSON": {
    short: "JavaScript Object Notation",
    tr: "Veri Değişim Formatı",
    desc: "İnsan tarafından okunabilir, yapılandırılmış veri saklama ve iletme formatı. API'lerde standart veri formatıdır.",
    example: '{\"name\": \"ChatGPT\", \"type\": \"LLM\"} bir JSON verisidir. API yanıtları genellikle bu formatta gelir.',
    related: ["API", "Data", "REST"]
  },
  "Kubernetes": {
    short: "Container Orchestration",
    tr: "Konteyner Yönetim Sistemi",
    desc: "Docker container'larını büyük ölçekte yönetmek, ölçeklendirmek ve otomatize etmek için kullanılan platform.",
    example: "AI servisinize aynı anda binlerce istek geldiğinde Kubernetes otomatik olarak yeni container'lar açar, yük azalınca kapatır.",
    related: ["Docker", "DevOps", "Cloud"]
  },
  "Latency": {
    short: "Gecikme Süresi",
    tr: "Gecikme / Yanıt Süresi",
    desc: "Bir isteğin gönderilmesi ile yanıtın alınması arasındaki süre.",
    example: "GPT-4 daha akıllıdır ama yanıt süresi (latency) GPT-3.5'ten yüksektir. Gerçek zamanlı uygulamalarda düşük latency kritiktir.",
    related: ["Inference", "Performance", "Throughput"]
  },
  "LLM": {
    short: "Large Language Model",
    tr: "Büyük Dil Modeli",
    desc: "Milyarlarca parametre ile eğitilmiş, metin anlama ve üretme kapasitesine sahip yapay zeka modelleri.",
    example: "ChatGPT, Claude, Gemini, LLaMA gibi modeller LLM'dir. Metin yazabilir, kod üretebilir, çeviri yapabilir.",
    related: ["Fine-tuning", "Transformer", "Token"]
  },
  "LoRA": {
    short: "Low-Rank Adaptation",
    tr: "Düşük Dereceli Uyarlama",
    desc: "Büyük modelleri çok daha az hesaplama gücüyle fine-tune etmeyi sağlayan verimli bir yöntem.",
    example: "Normalde bir LLM'i fine-tune etmek için güçlü GPU'lar gerekir. LoRA ile aynı işi normal bir bilgisayarda yapabilirsiniz.",
    related: ["Fine-tuning", "LLM", "QLoRA"]
  },
  "Machine Learning": {
    short: "Makine Öğrenmesi",
    tr: "Makine Öğrenmesi",
    desc: "Bilgisayarların açıkça programlanmadan verilerden öğrenme yeteneği. AI'ın en temel dalıdır.",
    example: "Spam filtreniz binlerce spam/normal e-postadan öğrenip yeni gelen e-postaları otomatik sınıflandırır. Bu makine öğrenmesidir.",
    related: ["Deep Learning", "Training", "Dataset"]
  },
  "MCP": {
    short: "Model Context Protocol",
    tr: "Model Bağlam Protokolü",
    desc: "AI araçlarını dış servislerle (dosya sistemi, veritabanı, API'ler) bağlayan standart protokol. Anthropic tarafından geliştirildi.",
    example: "Claude'a 'Google Calendar'ıma bak' dediğinizde, MCP aracılığıyla takviminize erişir. Her servise ayrı entegrasyon yazmak yerine tek standart.",
    related: ["API", "Agent", "Tool Use"]
  },
  "Multimodal": {
    short: "Çok Modlu",
    tr: "Çok Modlu / Çoklu Ortam",
    desc: "Birden fazla veri türünü (metin, görsel, ses, video) aynı anda anlayıp işleyebilen AI modelleri.",
    example: "GPT-4V'ye bir fotoğraf gönderip 'bu nedir?' diye sorabilirsiniz. Model hem metin hem görsel anlayabilir — bu multimodal'dir.",
    related: ["LLM", "Computer Vision", "Audio"]
  },
  "Neural Network": {
    short: "Yapay Sinir Ağı",
    tr: "Yapay Sinir Ağı",
    desc: "İnsan beyninden esinlenen, birbirine bağlı düğümlerden oluşan hesaplama modeli. Tüm modern AI'ın temelini oluşturur.",
    example: "Bir sinir ağı girdi → gizli katmanlar → çıktı şeklinde çalışır. Her bağlantının bir 'ağırlığı' vardır ve eğitimle bu ağırlıklar optimize edilir.",
    related: ["Deep Learning", "Transformer", "Training"]
  },
  "NLP": {
    short: "Natural Language Processing",
    tr: "Doğal Dil İşleme",
    desc: "Bilgisayarların insan dilini anlama, yorumlama ve üretme yeteneği.",
    example: "Siri'ye 'yarın hava nasıl olacak?' dediğinizde, NLP cümlenizi anlar, niyetinizi çıkarır ve uygun yanıtı oluşturur.",
    related: ["LLM", "Tokenization", "Sentiment Analysis"]
  },
  "OCR": {
    short: "Optical Character Recognition",
    tr: "Optik Karakter Tanıma",
    desc: "Görüntülerdeki metinleri dijital yazıya dönüştüren teknoloji.",
    example: "Belgenin fotoğrafını çekip OCR'dan geçirirsiniz, tüm metin kopyalanabilir/aranabilir hale gelir. Google Lens bunu yapıyor.",
    related: ["Computer Vision", "Document AI", "PDF"]
  },
  "Open Source": {
    short: "Açık Kaynak",
    tr: "Açık Kaynak Kodlu",
    desc: "Kaynak kodu herkese açık olan, ücretsiz kullanılabilen ve değiştirilebilen yazılımlar.",
    example: "LLaMA, Mistral, FLUX açık kaynak AI modelleridir. İndirir, kendi bilgisayarınızda çalıştırır, değiştirip kendi projenizde kullanabilirsiniz.",
    related: ["GitHub", "Hugging Face", "License"]
  },
  "OSINT": {
    short: "Open Source Intelligence",
    tr: "Açık Kaynak İstihbarat",
    desc: "Halka açık kaynaklardan (web siteleri, sosyal medya, kamu kayıtları) sistematik bilgi toplama yöntemi.",
    example: "Bir şirketin web sitesi, LinkedIn profilleri, patent kayıtları ve haber arşivlerini tarayarak kapsamlı profil oluşturmak OSINT'tir.",
    related: ["Web Scraping", "Security", "Data Mining"]
  },
  "Parameter": {
    short: "Model Parametresi",
    tr: "Parametre / Ağırlık",
    desc: "Bir modelin eğitim sırasında öğrendiği sayısal değerler. Parametre sayısı modelin kapasitesini gösterir.",
    example: "GPT-4'ün yaklaşık 1.7 trilyon parametresi olduğu tahmin ediliyor. LLaMA 3'ün 8B, 70B, 405B versiyonları var (B = milyar).",
    related: ["LLM", "Training", "Weights"]
  },
  "Pipeline": {
    short: "İş Akışı Hattı",
    tr: "İş Hattı / Boru Hattı",
    desc: "Verilerin birden fazla işlem adımından sırayla geçtiği otomatize edilmiş iş akışı.",
    example: "Bir RAG pipeline'ı: belge yükleme → metin parçalama → embedding → veritabanına kaydetme → sorgu → yanıt üretme adımlarından oluşur.",
    related: ["Workflow", "CI/CD", "ETL"]
  },
  "Prompt Engineering": {
    short: "İstem Mühendisliği",
    tr: "İstem / Komut Tasarımı",
    desc: "AI modellerinden en iyi sonucu almak için girdi metinlerini optimize etme sanatı ve bilimi.",
    example: "'Metin yaz' yerine 'Deneyimli bir copywriter olarak B2B SaaS ürünü için 100 kelimelik landing page metni yaz' çok daha iyi sonuç verir.",
    related: ["LLM", "Chain of Thought", "System Prompt"]
  },
  "QLoRA": {
    short: "Quantized LoRA",
    tr: "Nicelenmiş LoRA",
    desc: "LoRA'yı quantization ile birleştirerek daha da az bellek kullanan fine-tuning yöntemi.",
    example: "QLoRA ile 65B parametreli bir modeli tek bir 48GB GPU'da fine-tune edebilirsiniz. Normal yoldan bunun için 10+ GPU gerekirdi.",
    related: ["LoRA", "Quantization", "Fine-tuning"]
  },
  "Quantization": {
    short: "Model Niceleme",
    tr: "Niceleme / Küçültme",
    desc: "Model ağırlıklarını daha az bit ile temsil ederek boyutunu ve bellek ihtiyacını düşürme tekniği.",
    example: "Bir 70B model normalde 140GB RAM ister. 4-bit quantization ile ~35GB'a düşer ve normal bir bilgisayarda çalışabilir hale gelir.",
    related: ["GGUF", "GPTQ", "Inference"]
  },
  "RAG": {
    short: "Retrieval Augmented Generation",
    tr: "Artırılmış Erişimli Üretim",
    desc: "LLM'lerin dış kaynaklardan (PDF, veritabanı, web) bilgi çekerek daha doğru ve güncel yanıtlar üretmesini sağlayan yöntem.",
    example: "Bir PDF yükleyip ChatGPT'ye soru sorduğunuzda, arka planda RAG çalışıyor — model belgeyi tarayıp ilgili kısmı bulup ona göre yanıt veriyor.",
    related: ["LLM", "Embedding", "Vector Database"]
  },
  "REST": {
    short: "RESTful API",
    tr: "REST Mimari Stili",
    desc: "Web API'leri tasarlamak için en yaygın kullanılan mimari stil. HTTP metodlarını (GET, POST, PUT, DELETE) kullanır.",
    example: "GET /users → kullanıcıları listele, POST /users → yeni kullanıcı oluştur. Çoğu AI API'si RESTful'dır.",
    related: ["API", "Endpoint", "JSON"]
  },
  "SDK": {
    short: "Software Development Kit",
    tr: "Yazılım Geliştirme Kiti",
    desc: "Belirli bir platform veya servis için yazılım geliştirmeyi kolaylaştıran araç ve kütüphane paketi.",
    example: "OpenAI Python SDK'sı ile 'pip install openai' yapıp birkaç satır kodla GPT modelini çağırabilirsiniz.",
    related: ["API", "Library", "Framework"]
  },
  "Semantic Search": {
    short: "Anlamsal Arama",
    tr: "Anlamsal / Anlam Tabanlı Arama",
    desc: "Kelime eşleşmesi yerine anlam benzerliğine dayalı arama yöntemi.",
    example: "'Ucuz uçak bileti' araması, 'ekonomik havayolu fiyatları' içeren sonuçları da bulur — çünkü anlamları benzerdir.",
    related: ["Embedding", "Vector Database", "RAG"]
  },
  "Self-Hosting": {
    short: "Kendi Sunucunda Barındırma",
    tr: "Kendi Sunucunda Çalıştırma",
    desc: "Bir yazılımı bulut servisi yerine kendi bilgisayarınızda veya sunucunuzda çalıştırmak.",
    example: "ChatGPT yerine LLaMA modelini kendi bilgisayarınızda çalıştırmak self-hosting'dir. Verileriniz dışarı çıkmaz.",
    related: ["Open Source", "Docker", "Privacy"]
  },
  "Stable Diffusion": {
    short: "Image Generation Model",
    tr: "Görüntü Üretim Modeli",
    desc: "Stability AI tarafından geliştirilen açık kaynak görüntü üretim modeli. Metin açıklamasından görsel oluşturur.",
    example: "ComfyUI veya Automatic1111 ile kendi bilgisayarınızda Stable Diffusion çalıştırıp sınırsız ücretsiz görsel üretebilirsiniz.",
    related: ["Diffusion Model", "FLUX", "ComfyUI"]
  },
  "System Prompt": {
    short: "Sistem İstemi",
    tr: "Sistem Komutu / Talimatı",
    desc: "AI modeline davranış kurallarını ve rolünü belirten gizli başlangıç talimatı.",
    example: "'Sen bir hukuk danışmanısın. Soruları Türk hukuku çerçevesinde yanıtla.' gibi bir system prompt, modelin tüm konuşma boyunca bu rolde kalmasını sağlar.",
    related: ["Prompt Engineering", "LLM", "Role"]
  },
  "TTS": {
    short: "Text-to-Speech",
    tr: "Metinden Sese Dönüştürme",
    desc: "Yazılı metni doğal insan sesine dönüştüren teknoloji.",
    example: "ElevenLabs veya OpenAI TTS ile yazdığınız bir metni gerçekçi insan sesine çevirebilirsiniz — podcast, sesli kitap, dış ses için.",
    related: ["STT", "Voice Cloning", "Audio"]
  },
  "STT": {
    short: "Speech-to-Text",
    tr: "Sesten Metne Dönüştürme",
    desc: "Konuşmayı yazılı metne çeviren teknoloji. Whisper en popüler açık kaynak STT modelidir.",
    example: "Toplantı kaydınızı Whisper'dan geçirirsiniz, tüm konuşma otomatik olarak metne dönüşür — özetleme için LLM'e verebilirsiniz.",
    related: ["TTS", "Whisper", "Transcription"]
  },
  "Token": {
    short: "Metin Birimi",
    tr: "Jeton / Metin Parçası",
    desc: "LLM'lerin metni işleme birimi. Bir kelime genellikle 1-3 token'dır. Kapasite ve maliyet token sayısıyla ölçülür.",
    example: "'Merhaba dünya' yaklaşık 2-4 token'dır. GPT-4o'nun 128K token context window'u var, yani ~100 sayfa metin işlenebilir.",
    related: ["LLM", "Context Window", "Transformer"]
  },
  "Tool Use": {
    short: "Araç Kullanımı",
    tr: "Araç Kullanma Yeteneği",
    desc: "AI modelinin hesap makinesi, web arama, kod çalıştırma gibi harici araçları çağırabilme yeteneği.",
    example: "Claude'a 'bu PDF'i özetle' dediğinizde, model PDF okuma aracını çağırır, içeriği alır ve özetler. Model tek başına PDF okuyamaz, araç kullanır.",
    related: ["Agent", "MCP", "Function Calling"]
  },
  "Transformer": {
    short: "Transformer Mimarisi",
    tr: "Dönüştürücü Mimari",
    desc: "Tüm modern LLM'lerin temelindeki sinir ağı mimarisi. 2017'de Google tarafından tanıtıldı.",
    example: "GPT'deki 'T' Transformer anlamına gelir. Bu mimari, metnin içindeki kelimelerin birbirleriyle ilişkisini 'attention' mekanizmasıyla anlar.",
    related: ["LLM", "Attention", "Token"]
  },
  "Vector Database": {
    short: "Vektör Veritabanı",
    tr: "Vektör Veritabanı",
    desc: "Embedding vektörlerini depolayan ve hızlı benzerlik araması yapabilen özel veritabanları.",
    example: "Pinecone, Chroma, Weaviate gibi araçlar vektör veritabanıdır. RAG sistemlerinde 'en alakalı belge parçasını bul' işini bunlar yapar.",
    related: ["Embedding", "RAG", "Semantic Search"]
  },
  "VRAM": {
    short: "Video RAM",
    tr: "Grafik Kartı Belleği",
    desc: "GPU üzerindeki bellek. AI modellerini çalıştırmak için gereken VRAM miktarı, model boyutuna bağlıdır.",
    example: "7B parametreli bir modeli 4-bit quantization ile çalıştırmak için ~6GB VRAM yeterli. 70B model için ~40GB VRAM gerekir.",
    related: ["GPU", "Quantization", "Inference"]
  },
  "Web Scraping": {
    short: "Web Kazıma",
    tr: "Web Kazıma / Veri Çekme",
    desc: "Web sitelerinden otomatik olarak veri toplama işlemi.",
    example: "Bir e-ticaret sitesindeki tüm ürün fiyatlarını otomatik çekip Excel'e kaydetmek web scraping'dir. BeautifulSoup ve Scrapy popüler araçlardır.",
    related: ["OSINT", "Data Mining", "Automation"]
  },
  "Webhook": {
    short: "Otomatik Bildirim",
    tr: "Web Kancası / Otomatik Geri Çağırma",
    desc: "Bir olay gerçekleştiğinde otomatik olarak belirtilen URL'ye bildirim gönderen mekanizma.",
    example: "GitHub'da PR açıldığında Slack'e otomatik mesaj gitmesi bir webhook'tur. 'Bir şey olduğunda beni haberdar et' mantığıyla çalışır.",
    related: ["API", "Automation", "Integration"]
  },
  "Weights": {
    short: "Model Ağırlıkları",
    tr: "Ağırlıklar / Parametreler",
    desc: "Eğitim sonunda modelin öğrendiği sayısal değerler. Model dosyası aslında bu ağırlıkların toplamıdır.",
    example: "Hugging Face'ten bir model indirdiğinizde aslında ağırlık dosyalarını indiriyorsunuz. LLaMA 70B'nin ağırlıkları ~140GB tutar.",
    related: ["Parameter", "Training", "Checkpoint"]
  }
};

const GLOSSARY_TERMS = Object.keys(GLOSSARY);

// ─── NOTEBOOKLM PROMPTS CONTENT (TR) ────────────────────────
const NOTEBOOKLM_CONTENT = {
  intro: {
    title: "NotebookLM'i Farklı Kılan Nedir (Ve Neden Önemli)?",
    text: "Çoğu kişi NotebookLM'i, dosya yükleme özelliği olan bir ChatGPT gibi kullanır. PDF yüklerler. \"Bunu özetle\" derler. Sıradan bir özet alırlar. Sonra da ne heyecanın ne olduğunu merak ederler.\n\nİşte kaçırdıkları şey: NotebookLM kaynak temelli çalışır.\n\nSadece yüklediğiniz kaynakları kullanır. İnternetten bilgi çekmez. Eğitim verisine başvurmaz. Sadece sizin kaynaklarınız.\n\nBu şu anlama gelir:\n• Sıfır halüsinasyon\n• Her yanıt kaynağa dayalı\n• Bilginin nereden geldiğini tam olarak bilirsiniz\n\nPeki yakalayış nedir? Nasıl soracağını bilmen gerekiyor. Genel prompt'lar = genel yanıtlar. Spesifik, yapılandırılmış prompt'lar = çalışma şeklinizi değiştiren yanıtlar."
  },
  howToUse: {
    title: "Bu Prompt'ları Nasıl Kullanırsınız (Temel Adımlar)",
    steps: [
      "notebooklm.google.com adresine gidin",
      "\"Yeni not defteri oluştur\" butonuna tıklayın",
      "Kaynaklarınızı yükleyin: PDF (500.000 kelime veya 200MB), Google Docs/Slides/Sheets, Web URL'leri, YouTube videoları, ses dosyaları (MP3, WAV) veya kopyala-yapıştır metin",
      "İşlenmesi için 10-30 saniye bekleyin",
      "Aşağıdaki prompt'ları sohbet kutusuna kopyala-yapıştır yapın"
    ]
  },
  prompts: [
    {
      id: 1,
      title: "\"5 TEMEL SORU\" PROMPT'U",
      what: "Reddit'te \"oyun değiştirici\" olarak adlandırıldı. NotebookLM'i yüzeysel özetler yerine pedagojik olarak sağlam yapılar çıkarmaya zorlar.",
      when: "Aynı konuda birden fazla kaynak olduğunda • Temel kavramları hızlıca anlamak gerektiğinde • Sınava hazırlanırken • Araştırma sentezi yaparken",
      prompt: "Analyze all inputs and generate 5 essential questions that, when answered, capture the main points and core meaning of all inputs.",
      why: "Yapı dayatır. NotebookLM bilgiyi dökmek yerine, gerçekten neyin önemli olduğunu belirler ve bunu bir uzmana soracağınız sorular şeklinde çerçeveler."
    },
    {
      id: 2,
      title: "DERS İÇERİKLERİ İÇİN KAPSAMLI PROMPT",
      what: "Özellikle ders materyalleri için tasarlandı. Profesörlerin gerçekte kullandığı pedagojik yapıyı çıkarır.",
      when: "Ders sunumları yüklediğinizde • Ders kayıtları • Eğitim materyalleri • Ders notları",
      prompt: "Review all uploaded materials and generate 5 essential questions that capture the core meaning.\nFocus on:\n- Core topics and definitions\n- Key concepts emphasized\n- Relationships between concepts\n- Practical applications mentioned",
      why: "Öğretmenlerin bilgiyi nasıl yapılandırdığını yansıtır: tanımlar → kavramlar → ilişkiler → uygulamalar. Materyalin öğretilme şekline uygun bir çalışma rehberi oluşturur."
    },
    {
      id: 3,
      title: "STEVEN JOHNSON'IN \"İLGİNÇ PARÇALAR\" PROMPT'U",
      what: "NotebookLM'in yöneticisi Steven Johnson, bunu NASA'nın 500.000 kelimelik transkriptlerinde test etti. 10 saatlik manuel çalışmayı 20 saniyede yaptı.",
      when: "Uzun belgeler • Araştırma makaleleri • Yoğun kaynak materyali • \"Vay be\" faktörünü bulmak istediğinizde",
      prompt: "What are the most surprising or interesting pieces of information in these sources? Include key quotes.",
      why: "Geleneksel arama anahtar kelime bulur. Bu prompt ise ilginçliği bulur. Her şeyi iki kez okuduktan sonra ancak yakalayabileceğiniz içgörüleri ortaya çıkarır."
    },
    {
      id: 4,
      title: "YÖNLENDİRMELİ GENİŞLETİLMİŞ VERSİYON",
      what: "Steven Johnson'ın prompt'unun odaklanmış hali. Belirli bir konuda yazıyorsanız ve hedeflenmiş içgörüler gerektiğinde kullanılır.",
      when: "Makale yazarken • Belirli bir açıyla araştırma yaparken • İçerik üretirken • Benzersiz perspektifler ararken",
      prompt: "I'm interested in writing about [KONU].\nWhat are the most surprising facts or ideas related to [KONU] in these sources?\nInclude key quotes. Focus on [BELİRLİ YÖNÜ], not [DİĞER YÖNLER].",
      why: "Geleneksel arama \"ilginçliği\" yüzeye çıkaramaz. Bu prompt çıkarır. Yönlendirme (\"X'e odaklan, Y'ye değil\") prompt'u rayında tutar."
    },
    {
      id: 5,
      title: "YARIŞMA PROGRAMI FORMATI (Sesli Genel Bakış)",
      what: "Öğrenciler bunu çok seviyor. AI sunucuları birbirlerini sınav eder ve kasıtlı olarak yanlış cevap verir, böylece düzeltmeler hafızanızda kalır.",
      when: "Sınav çalışırken • Yeni konular öğrenirken • Aktif hatırlama pratiği • Yolculukta öğrenme",
      prompt: "A quiz show with two hosts. First host quizzes the second on [KONU]. 10 questions total. Mix of multiple choice and True/False.\nThe host gets answers wrong sometimes. The other corrects with right answers. Share results at the end.",
      why: "Yanlış yapmak → düzeltilmek = sadece bilgi duymaktan çok daha güçlü hafıza oluşturur. Bu, beyninizin gerçekte nasıl öğrendiğini kullanır.",
      note: "Bu prompt, normal sohbet kutusuna değil, Sesli Genel Bakış oluştururken \"Özelleştir\" kutusuna yazılır."
    },
    {
      id: 6,
      title: "ÇOK DİLLİ PODCAST HACK'İ",
      what: "NotebookLM'in resmi dil desteği olmadan önce kullanıcılar İspanyolca, Almanca, Japonca vb. dillerde podcast oluşturdu.",
      when: "Başka bir dilde öğrenirken • İngilizce olmayan hedef kitle için içerik üretirken • Dil pratiği • Uluslararası araştırma",
      prompt: "This is the first international special episode of Deep Dive conducted entirely in [DİL].\nSpecial Instructions:\n- Only [DİL] for entire duration\n- No English except to clarify unique terms",
      why: "NotebookLM'in sunucuları talimatları takip eder. \"Özel bölüm\" çerçevelemesi, hangi dili belirtirseniz o dilde konuşma tonunu tetikler.",
      note: "Bu prompt, Sesli Genel Bakış \"Özelleştir\" kutusuna yazılır."
    },
    {
      id: 7,
      title: "ÜRÜN YÖNETİCİSİ KİŞİLİĞİ (Resmi Google)",
      what: "Belgeleri karar memorandumlarına dönüştürür. Dolgu içerikleri keser, ürün kararları için önemli olanı bulur.",
      when: "Ürün araştırması • Kullanıcı geri bildirim analizi • Özellik önceliklendirme • Stratejik planlama",
      prompt: "Act as a Lead Product Manager reviewing internal documentation. Ruthlessly scan for actionable insights, ignoring fluff.\nSynthesize into \"Decision Memo\" format:\n- User Evidence: Direct quotes indicating user problems\n- Feasibility Checks: Technical constraints mentioned\n- Blind Spots: What's missing from source text\nUse bullets. If I ask vague questions, force me to clarify.",
      why: "Kişilik, NotebookLM'in bilgiyi nasıl önceliklendirdiğini değiştirir. Kanıt, kısıtlama ve boşlukları arar — tam olarak PM'lerin karar vermesi için gerekenleri."
    },
    {
      id: 8,
      title: "BİLİMSEL ARAŞTIRMACI KİŞİLİĞİ (Resmi Google)",
      what: "Sonuçlardan çok metodolojiye ihtiyaç duyan akademisyenler için. Araştırmanın ne bulduğuna değil, nasıl yapıldığına odaklanır.",
      when: "Akademik araştırma • Literatür taraması • Metodoloji analizi • Hakemli değerlendirme hazırlığı",
      prompt: "Act as research assistant for a senior scientist. Tone: strictly objective, formal, precise.\nAssume advanced knowledge of [ALAN]. Don't define standard terminology.\nFocus on methodology, data integrity, and conflicting evidence.\nPrioritize sample size, experimental design, and statistical significance over general conclusions.\nFormat with bolded sections:\n- Key Findings\n- Methodological Strengths/Weaknesses\n- Contradictions",
      why: "Temelleri atlar. Araştırmacıların gerçekten önemsediği şeylere doğrudan gider: Buna güvenebilir miyim? Nasıl yapılmış? Çelişki nerede?"
    },
    {
      id: 9,
      title: "ORTAOKUL ÖĞRETMENİ KİŞİLİĞİ (Resmi Google)",
      what: "Yoğun içeriği erişilebilir hale getirir. Jargonu 7. sınıf öğrencisinin anlayacağı dile çevirir.",
      when: "Karmaşık konuları uzman olmayanlara açıklamak • Başlangıç seviyesi içerik oluşturmak • Öğretim • Paydaşlar için sadeleştirme",
      prompt: "Act as an engaging Middle School Teacher. Translate source documents into language a 7th grader understands.\nStructure every response:\n- The \"tl;dr\": One sentence using simple words\n- Analogy: Real-world metaphor for the concept\n- Vocab List: 3 difficult words defined simply\nFor dense paragraphs, break into True or False quiz format.",
      why: "Yapı aracılığıyla sadeleştirmeyi zorlar. Analoji gerekliliği, jargonun arkasına saklanamayacağınız anlamına gelir."
    },
    {
      id: 10,
      title: "LİTERATÜR TARAMASI TEMALARI PROMPT'U",
      what: "Birden fazla makaleyi sentezleyen araştırmacılar için. Tüm kaynaklarınız arasındaki tekrarlayan temaları belirler.",
      when: "Akademik literatür taramaları • Araştırma sentezi • Bir alanı anlamak • Konsensüs bulmak",
      prompt: "From papers on [KONU], identify 5-10 most recurring themes.\nFor each theme provide:\n1. Short definition in your own words\n2. Which papers mention it (with citations)\n3. One sentence on how it's treated (debated, assumed, tested)\nPresent as structured table.",
      why: "Araştırmada önemli olan temadır. Bu prompt onları sistematik olarak, doğru atıflarla çıkarır; böylece kaynakları doğru şekilde referans gösterebilirsiniz."
    },
    {
      id: 11,
      title: "ÇELİŞKİ BULMA PROMPT'U",
      what: "Kaynaklarınız arasındaki anlaşmazlıkları ortaya çıkarır. Uzmanların nerede ve neden anlaşamadığını gösterir.",
      when: "Çelişen kaynaklarla araştırma • Tartışmaları anlama • Doğrulama kontrolü • Akademik yazarlık",
      prompt: "From papers on [KONU], identify major contradictions or conflicting findings.\nFor each contradiction provide:\n1. Specific claim from each side (quoted with citations)\n2. Possible reasons for disagreement (method, sample, context)\n3. What evidence would resolve the conflict",
      why: "Çoğu özet çelişkileri gizler. Bu prompt onları atıflarla birlikte ortaya çıkarır; böylece daha derine inebilir veya tartışmayı yazınızda kabul edebilirsiniz."
    },
    {
      id: 12,
      title: "KAYNAK TEMELLİ BOŞLUK ANALİZİ",
      what: "Bir şeyi deneyip başarısız olduğunuzda, girişiminizi yüklediğiniz materyallerle karşılaştırarak neyi kaçırdığınızı gösterir.",
      when: "Başarısız denemeleri hata ayıklama • Hatalardan öğrenme • Uygulama sorunlarını giderme • Beceri geliştirme",
      prompt: "Analyze this attempt against my uploaded materials:\nProject: [NE DENEDİM]\nMy approach: [ATTIĞIM ADIMLAR]\nResult: [NE OLDU]\nExpected: [NE OLMASI GEREKİYORDU]\n\nCross-reference with sources:\n- Quote methodologies I didn't follow\n- Identify concepts I missed entirely\n- Find prerequisites I skipped\nOutput: \"Gap in [concept]: You missed [step], but [Source, Page X] states: '[quote]'\"",
      why: "Bir uzmanın çalışmanızı kaynak materyalle karşılaştırarak incelemesi gibi. Tam olarak nerede sapma yaptığınızı ve neyi kaçırdığınızı gösterir."
    },
    {
      id: 13,
      title: "KAVRAM UYGULAMA PROMPT'U",
      what: "Araştırmayı uygulanabilir adımlara dönüştürür. Teoriyi kaynak atıflarıyla pratiğe çevirir.",
      when: "Yeni beceriler öğrenirken • Uygulama planlaması • Araştırmayı eyleme dönüştürme • Adım adım rehberler",
      prompt: "Help me implement the concept of [KONU].\nFor each relevant source:\n1. Quote key evidence\n2. Connect it to other retrieved information\n3. Note conflicting viewpoints\n4. Provide a clear action to take\nSynthesize into ordered action list with thorough, actionable steps.\nGround all points in specific quotes. Acknowledge knowledge gaps.",
      why: "Çoğu araştırma teorik kalır. Bu prompt, NotebookLM'i kaynak temelliliğini koruyarak somut eylemler çıkarmaya zorlar."
    },
    {
      id: 14,
      title: "KAVRAM SENTEZİ PROMPT'U",
      what: "Fikirler arasında belirgin olmayan bağlantıları bulur. Kaynaklar açıkça bağlantı kurmasa bile kavramların nasıl ilişkili olduğunu gösterir.",
      when: "Yaratıcı problem çözme • Disiplinlerarası araştırma • Yeni açılar bulma • Birbirinden bağımsız fikirleri bağlama",
      prompt: "Synthesize the connection, however abstract, between [KONU 1] and [KONU 2].\nFor each relevant source:\n1. Quote key evidence\n2. Connect to other retrieved information\n3. Note conflicting viewpoints\n4. Note interesting combinations\nSynthesize into clear summary focusing on connections.\nGround all points in quotes. Acknowledge gaps.",
      why: "Temellendirmeyi koruyarak soyutlamayı zorlar. Kaynaklarınız tarafından desteklenen yaratıcı bağlantılar elde edersiniz."
    },
    {
      id: 15,
      title: "KAPSAMLI KONU ANALİZİ",
      what: "Maksimum uzunlukta, derinlemesine araştırılmış çıktı. Bu, \"bana her şeyi ver\" prompt'udur.",
      when: "Derin araştırma • Kapsamlı anlayış • Araştırma makalesi yazma • Uzman düzeyinde analiz",
      prompt: "Provide accurate, well-reasoned information about [KONU].\nPlanning:\n- Essential aspects to explore?\n- Key questions to answer?\n- Existing debates or controversies?\nStructure:\nOVERVIEW: Summary, major concepts, current relevance\nANALYSIS: Evidence-supported discussion, examples, limitations\nSOURCES: Key sources, conflicts, confidence levels\nStandards:\n- Separate facts from interpretations\n- Support claims with evidence\n- Maintain objectivity",
      why: "Planlama bölümü NotebookLM'i yanıtlamadan önce düşünmeye zorlar. Yapı, kapsamlı kapsam sağlar. Standartlar, titizliği korur."
    },
    {
      id: 16,
      title: "TARTIŞMA FORMATI PROMPT'U",
      what: "Rakip bakış açılarını karşı karşıya getirir. Kaynaklarınız anlaşmadığında mükemmeldir.",
      when: "Tartışmalı konular • Birden fazla perspektif • Tartışmaları anlama • Sesli öğrenme",
      prompt: "Generate a debate between two hosts with opposing viewpoints on [KONU].\nHost 1 argues for [POZİSYON A]. Host 2 argues for [POZİSYON B].\nThey should challenge each other's points, cite specific evidence from sources, and let the listener decide who made the stronger case.",
      why: "Tartışma formatı, çelişkileri kafa karıştırıcı değil, ilgi çekici hale getirir. Her iki tarafı da atıflarla duyar ve kendiniz karar verirsiniz.",
      note: "Bu prompt, Sesli Genel Bakış \"Özelleştir\" kutusuna yazılır."
    }
  ],
  tips: {
    title: "Tüm Viral NotebookLM Prompt'larındaki Ortak Desen",
    patterns: [
      "Spesifik alıntılar ve atıflar iste",
      "Sadece özet değil, çelişkiler de sor",
      "Boşlukların kabul edilmesini talep et",
      "Yapılandırılmış çıktı formatları zorla"
    ],
    usage: {
      title: "En Doğru Şekilde Nasıl Kullanılır",
      scenarios: [
        { case: "Çalışıyorsanız", suggestion: "Prompt #2 (Dersler) veya #5 (Yarışma Programı) deneyin" },
        { case: "Araştırıyorsanız", suggestion: "Prompt #10 (Temalar) veya #11 (Çelişkiler) deneyin" },
        { case: "Yazıyorsanız", suggestion: "Prompt #4 (Yönlendirmeli) veya #13 (Uygulama) deneyin" },
        { case: "Öğreniyorsanız", suggestion: "Prompt #9 (Ortaokul Öğretmeni) veya #16 (Tartışma) deneyin" }
      ]
    },
    problems: [
      { problem: "Çıktı çok genel", fix: "Daha spesifik talimatlar ekleyin. [KONU] yerine gerçek detayları yazın." },
      { problem: "Aradığımı bulamıyorum", fix: "Kaynaklarınızı kontrol edin. NotebookLM sadece yüklediğinizle çalışır." },
      { problem: "Atıflar eksik", fix: "Kaynak içeriğiniz çok kısa olabilir. Yeterli içerik olduğunda atıf yapar." },
      { problem: "Sesli Genel Bakış çalışmıyor", fix: "Sesli prompt'lar (#5, #6, #16) normal sohbete değil, \"Özelleştir\" kutusuna yazılır." },
      { problem: "Kişilik prompt'umu yoksayıyor", fix: "Kişilikler tutarlı olunca en iyi çalışır. Aynı konuşmada farklı roller arasında geçiş yapmayın." }
    ],
    combos: [
      { name: "Derin Araştırma", steps: ["#1 (5 Temel Soru)", "#11 (Çelişkiler)", "#15 (Kapsamlı Analiz)"] },
      { name: "Sınav Hazırlığı", steps: ["#2 (Dersler)", "#5 (Sesli Yarışma Programı)", "#9 (Ortaokul Öğretmeni)"] },
      { name: "İçerik Üretimi", steps: ["#3 (İlginç Parçalar)", "#4 (Yönlendirmeli)", "#13 (Uygulama)"] },
      { name: "Akademik Araştırma", steps: ["#10 (Temalar)", "#11 (Çelişkiler)", "#8 (Bilimsel Araştırmacı)"] }
    ]
  }
};

// ─── CATEGORIES ─────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", name: "All (Tümü)", icon: "◈" },
  { id: "agents", name: "AI Agents (Ajanlar)", icon: "◉" },
  { id: "llm", name: "LLM Tools (Dil Modeli Araçları)", icon: "◎" },
  { id: "rag", name: "RAG & Search (Arama)", icon: "◇" },
  { id: "code", name: "Code (Kod Araçları)", icon: "◆" },
  { id: "image", name: "Image & Media (Görsel)", icon: "◐" },
  { id: "memory", name: "Memory (Hafıza)", icon: "◑" },
  { id: "productivity", name: "Productivity (Verimlilik)", icon: "◒" },
  { id: "devops", name: "DevOps & Infra (Altyapı)", icon: "◓" },
  { id: "security", name: "Security & OSINT (Güvenlik)", icon: "◔" },
  { id: "data", name: "Data & Analytics (Veri)", icon: "◕" },
  { id: "models", name: "Open Source Models (Açık Kaynak)", icon: "◖" },
  { id: "finetuning", name: "Fine-tuning (İnce Ayar)", icon: "◗" },
  { id: "mcp", name: "MCP & Protocols (Protokoller)", icon: "◘" },
  { id: "hardware", name: "Hardware & IoT (Donanım)", icon: "◙" },
  { id: "other", name: "Other (Diğer)", icon: "○" },
  { id: "guides", name: "Guides (Rehberler)", icon: "◈" },
  { id: "courses", name: "Courses (Kurslar)", icon: "◎" },
];

// ─── DEMO DATA ──────────────────────────────────────────────
const DEFAULT_DATA = toolsData;

// ─── AUTO CATEGORY DETECTION ────────────────────────────────
function detectCategory(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("agent") || t.includes("automat") || t.includes("browser-use")) return "agents";
  if (t.includes("rag") || t.includes("retrieval") || t.includes("search") || t.includes("embedding")) return "rag";
  if (t.includes("code") || t.includes("copilot") || t.includes("cursor") || t.includes("ide") || t.includes("programming")) return "code";
  if (t.includes("image") || t.includes("diffusion") || t.includes("flux") || t.includes("video") || t.includes("media")) return "image";
  if (t.includes("memory") || t.includes("context")) return "memory";
  if (t.includes("llm") || t.includes("language model") || t.includes("transformer") || t.includes("gpt") || t.includes("claude")) return "llm";
  if (t.includes("fine-tun") || t.includes("finetun") || t.includes("lora") || t.includes("training")) return "finetuning";
  if (t.includes("mcp") || t.includes("protocol")) return "mcp";
  if (t.includes("osint") || t.includes("security") || t.includes("pentest") || t.includes("hack")) return "security";
  if (t.includes("docker") || t.includes("deploy") || t.includes("infra") || t.includes("kubernetes") || t.includes("ci/cd")) return "devops";
  if (t.includes("data") || t.includes("analytic") || t.includes("dashboard") || t.includes("csv")) return "data";
  if (t.includes("open source") || t.includes("hugging") || t.includes("weights") || t.includes("model")) return "models";
  if (t.includes("productiv") || t.includes("workflow") || t.includes("notion") || t.includes("obsidian")) return "productivity";
  if (t.includes("arduino") || t.includes("raspberry") || t.includes("iot") || t.includes("hardware")) return "hardware";
  return "other";
}

// ─── GLOSSARY HIGHLIGHT COMPONENT ───────────────────────────
function GlossaryText({ text }) {
  const [activeTerm, setActiveTerm] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!text) return null;

  // Build regex from glossary terms (longest first to avoid partial matches)
  const sortedTerms = [...GLOSSARY_TERMS].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'term', content: match[0], key: match[0].toUpperCase() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  const handleTermHover = (e, termKey) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + 8 });
    setActiveTerm(termKey);
  };

  return (
    <span ref={containerRef} style={{ position: 'relative' }}>
      {parts.map((part, i) =>
        part.type === 'term' ? (
          <span
            key={i}
            onMouseEnter={(e) => handleTermHover(e, GLOSSARY[part.key] ? part.key : Object.keys(GLOSSARY).find(k => k.toUpperCase() === part.key))}
            onMouseLeave={() => setActiveTerm(null)}
            style={styles.glossaryTerm}
          >
            {part.content}
          </span>
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
      {activeTerm && GLOSSARY[activeTerm] && (
        <GlossaryTooltip term={activeTerm} data={GLOSSARY[activeTerm]} pos={tooltipPos} />
      )}
    </span>
  );
}

function GlossaryTooltip({ term, data, pos }) {
  return (
    <div style={{
      ...styles.tooltip,
      position: 'fixed',
      // Ensure the tooltip never overflows the right edge, accounting for scrollbars
      left: Math.min(pos.x, window.innerWidth - 380),
      top: pos.y,
      zIndex: 9999,
    }}>
      <div style={styles.tooltipHeader}>
        <strong>{term}</strong>
        <span style={styles.tooltipShort}>{data.short}</span>
      </div>
      {data.tr && <div style={styles.tooltipTr}>{data.tr}</div>}
      <p style={styles.tooltipDesc}>{data.desc}</p>
      {data.example && (
        <div style={styles.tooltipExample}>
          <span style={{ fontWeight: 600 }}>Örnek: </span>{data.example}
        </div>
      )}
      {data.related?.length > 0 && (
        <div style={styles.tooltipRelated}>
          İlişkili: {data.related.join(" · ")}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function SelfAI() {
  const [items, setItems] = useState(DEFAULT_DATA);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    localStorage.getItem("self_ai_category") || "all"
  );
  const [favorites, setFavorites] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showImport, setShowImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [showNotebookLM, setShowNotebookLM] = useState(false);
  const [hasStarted, setHasStarted] = useState(
    localStorage.getItem("self_ai_has_started") === "true"
  );
  const [isAiContentOpen, setIsAiContentOpen] = useState(false);
  const [showAiMap, setShowAiMap] = useState(false); // Add state for AI Yol Haritası
  // Save active category and hasStarted
  useEffect(() => {
    localStorage.setItem("self_ai_category", activeCategory);
  }, [activeCategory]);
  
  useEffect(() => {
    localStorage.setItem("self_ai_has_started", hasStarted);
  }, [hasStarted]);

  // Load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("self_ai_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items) setItems(parsed.items);
        if (parsed.favorites) setFavorites(parsed.favorites);
      }
    } catch (e) { }
  }, []);

  // Save to storage
  useEffect(() => {
    try {
      localStorage.setItem("self_ai_data", JSON.stringify({ items, favorites }));
    } catch (e) { }
  }, [items, favorites]);

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Toggle favorite
  const toggleFav = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = items.filter(item => {
      const matchSearch = !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchFav = !showFavOnly || favorites.includes(item.id);
      return matchSearch && matchCat && matchFav;
    });
    if (sortBy === "date") list.sort((a, b) => (b.added || "").localeCompare(a.added || ""));
    else if (sortBy === "title") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [items, search, activeCategory, showFavOnly, favorites, sortBy]);

  // Category counts
  const counts = useMemo(() => {
    const c = { all: items.length };
    items.forEach(i => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [items]);

  // Import JSON with duplicate detection
  const handleImport = useCallback((jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      const arr = Array.isArray(data) ? data : [data];

      let added = 0, skipped = 0;
      const existingIds = new Set(items.map(i => i.id));
      const existingTitles = new Set(items.map(i => i.title?.toLowerCase()));
      const newItems = [];

      for (const raw of arr) {
        const id = raw.id || `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Duplicate check
        if (existingIds.has(id) || existingIds.has(raw.id)) { skipped++; continue; }

        let title = raw.title || "";
        if (!title && raw.links?.github) {
          const parts = raw.links.github.split("/");
          title = parts[parts.length - 1] || "";
        }
        if (!title) title = (raw.description || raw.text || "").split("\n")[0]?.slice(0, 60) || "Untitled";

        if (existingTitles.has(title.toLowerCase())) { skipped++; continue; }

        const desc = raw.description || raw.text || "";
        const category = raw.category || detectCategory(title + " " + desc);

        // Extract links
        let links = raw.links || {};
        if (Array.isArray(raw.links)) {
          const gh = raw.links.find(l => l?.includes("github.com")) || "";
          const hf = raw.links.find(l => l?.includes("huggingface.co") || l?.includes("hf.co")) || "";
          const other = raw.links.filter(l => l && !l.includes("github.com") && !l.includes("huggingface") && !l.includes("t.co") && !l.includes("x.com"));
          links = { github: gh, huggingface: hf, other };
        }

        newItems.push({
          id, title, description: desc, category, links,
          status: raw.status || "active",
          note: raw.note || "",
          added: raw.added || raw.date_added || new Date().toISOString().slice(0, 10)
        });
        added++;
      }

      setItems(prev => [...prev, ...newItems]);
      setShowImport(false);
      notify(`${added} tool(s) added, ${skipped} duplicate(s) skipped`);
    } catch (err) {
      notify(`Error: ${err.message}`, "error");
    }
  }, [items, notify]);

  // Delete
  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setEditingItem(null);
    notify("Removed");
  }, [notify]);

  // Update
  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  // Export
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `self-ai_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [items]);

  return (
    <div style={{
      ...styles.app,
      ...(darkMode ? { background: "#1A1C24", color: "#D0D0D6" } : {}),
    }}>
      {/* ─── HEADER ─── */}
      <header style={{
        ...styles.header,
        ...(darkMode ? { background: "#22242E", borderColor: "#2C3040" } : {}),
      }}>
        <div style={styles.headerInner}>
          <div style={styles.logoArea}>
            <h1 style={styles.logo}>
              SELF<span style={styles.logoAccent}>-AI</span>
            </h1>
            <span style={styles.subtitle}>AI Tools Archive</span>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => setShowAddForm(true)} style={styles.btnAction}>+ Add (Ekle)</button>
            <button onClick={() => setShowImport(true)} style={styles.btnAction}>↑ Import JSON</button>
            <button onClick={handleExport} style={styles.btnAction}>↓ Export</button>
          </div>
        </div>
      </header>

      {/* ─── TOAST ─── */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#D7A6A3" : "#AFC6B4" }}>
          {toast.msg}
        </div>
      )}

      {/* ─── MODALS ─── */}
      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
      {showAddForm && <AddModal onAdd={(item) => { setItems(p => [item, ...p]); setShowAddForm(false); notify("Added!"); }} onClose={() => setShowAddForm(false)} />}
      {editingItem && <EditModal item={editingItem} onSave={(u) => { updateItem(editingItem.id, u); setEditingItem(null); notify("Updated!"); }} onDelete={() => deleteItem(editingItem.id)} onClose={() => setEditingItem(null)} />}
      {showNotebookLM && <NotebookLMDetailPage onClose={() => setShowNotebookLM(false)} />}

      {/* ─── START PAGE ─── */}
      {!hasStarted ? (
        <div style={styles.startPage}>
          <h1 style={styles.startTitle}>BAŞLARKEN...</h1>
          <img src="/ai-image.jpg" alt="AI YZ Görseli" style={styles.startImage} />
          
          <div style={styles.startContent}>
            <p>Yapay zekâ (AI), bilgisayarların metin üretme, görüntü tanıma, veri analiz etme veya problem çözme gibi normalde insan zekâsı gerektiren görevleri yerine getirebilmesini sağlayan teknolojilerin genel adıdır. Son yıllarda özellikle dil modellerinin (LLM) gelişmesiyle birlikte AI araçları yazılım geliştirmeden araştırmaya, üretkenlikten içerik üretimine kadar pek çok alanda günlük iş akışlarının bir parçası haline gelmiştir.</p>
            <p>Bu uygulama, yapay zekâ pratiklerine yeni başlayanlar için hem bir sözlük, hem bir rehber hem de farklı araç ve kaynaklara hızlı erişim sağlayan bir bilgi merkezi olarak tasarlanmıştır.</p>
            <p>Uygulama içerisinde; AI ile ilgili temel kavramlara göz atabilir, farklı araçlara ve projelere yönlendiren içerikleri keşfedebilir ve kendi oluşturacağınız kartlar sayesinde kişisel AI bilgi arşivinizi oluşturup düzenleyebilirsiniz. Böylece zamanla kendi öğrenme kaynaklarınızı tek bir yerde toplayan, sürekli gelişen bir referans kütüphanesi oluşturabilirsiniz.</p>
          </div>

          <button 
            onClick={() => {
              setHasStarted(true);
              setActiveCategory('none'); // Changed from 'all' to 'none' to show empty screen
              setShowAiMap(false);
            }} 
            style={styles.startEnterBtn}
          >
            GİRİŞ
          </button>
        </div>
      ) : (
      <>
      {/* ─── BODY ─── */}
      <div style={styles.body}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search tools... (Ara)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...styles.searchInput,
                ...(darkMode ? { background: "#22242E", borderColor: "#2C3040", color: "#D0D0D6" } : {}),
              }}
            />
            {search && <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>}
          </div>

          <button
            onClick={() => setShowFavOnly(p => !p)}
            style={{ ...styles.favFilter, ...(showFavOnly ? styles.favFilterActive : {}) }}
          >
            {showFavOnly ? "★" : "☆"} Favorites (Favoriler) {favorites.length > 0 && `(${favorites.length})`}
          </button>

          <div style={styles.catList}>
            {/* 1- AI YOL HARITASI */}
            <button
               onClick={() => { setActiveCategory("map"); setShowAiMap(false); }}
               style={{
                  ...styles.catBtn,
                  ...(darkMode && !(activeCategory === "map" && !showAiMap) ? { background: "#22242E", borderColor: "#2C3040", color: "#8A8E9A" } : {}),
                  ...(activeCategory === "map" && !showAiMap ? styles.catBtnActive : {}),
               }}
            >
               <span><span style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>🗺️</span> 1- AI YOL HARİTASI</span>
            </button>

            {/* 2- AI İÇERİK (Dropdown) */}
            <button
               onClick={() => setIsAiContentOpen(!isAiContentOpen)}
               style={{
                  ...styles.catBtn,
                  ...(darkMode ? { background: "#22242E", borderColor: "#2C3040", color: "#8A8E9A" } : {}),
               }}
            >
               <span><span style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>📚</span> 2- AI İÇERİK</span>
               <span style={{ fontSize: 14 }}>{isAiContentOpen ? "▲" : "▼"}</span>
            </button>
            
            {/* Dropdown Content */}
            {isAiContentOpen && (
               <div style={{ marginLeft: 16, borderLeft: "2px solid #E5E4E1", paddingLeft: 8, marginBottom: 10 }}>
                 {CATEGORIES.filter(cat => cat.id !== "courses").map(cat => (
                   <button
                     key={cat.id}
                     onClick={() => { setActiveCategory(cat.id); setShowAiMap(false); }}
                     style={{
                       ...styles.catBtn,
                       padding: "8px 12px",
                       fontSize: 13,
                       marginBottom: 4,
                       ...(darkMode && !(activeCategory === cat.id && !showAiMap) ? { background: "#22242E", borderColor: "#2C3040", color: "#8A8E9A" } : {}),
                       ...(activeCategory === cat.id && !showAiMap ? styles.catBtnActive : {}),
                     }}
                   >
                     <span><span style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>{cat.icon}</span> {cat.name}</span>
                     <span style={styles.catCount}>{counts[cat.id] || 0}</span>
                   </button>
                 ))}
               </div>
            )}

            {/* 3- ONLINE KURSLAR */}
            <button
               onClick={() => { setActiveCategory("courses"); setShowAiMap(false); }}
               style={{
                  ...styles.catBtn,
                  ...(darkMode && !(activeCategory === "courses" && !showAiMap) ? { background: "#22242E", borderColor: "#2C3040", color: "#8A8E9A" } : {}),
                  ...(activeCategory === "courses" && !showAiMap ? styles.catBtnActive : {}),
               }}
            >
               <span><span style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>🎓</span> 3- ONLINE KURSLAR</span>
               <span style={styles.catCount}>{counts["courses"] || 0}</span>
            </button>

            {/* 4- SÖZLÜK */}
            <button
               onClick={() => { setActiveCategory("glossary"); setShowAiMap(false); }}
               style={{
                  ...styles.catBtn,
                  ...(darkMode && !(activeCategory === "glossary" && !showAiMap) ? { background: "#22242E", borderColor: "#2C3040", color: "#8A8E9A" } : {}),
                  ...(activeCategory === "glossary" && !showAiMap ? styles.catBtnActive : {}),
               }}
            >
               <span><span style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>📖</span> 4- SÖZLÜK</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          {activeCategory === 'map' ? (
             <AiMapView darkMode={darkMode} />
          ) : activeCategory === 'none' ? (
             <div style={styles.empty}>
               <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
               <h3 style={{ fontSize: 24, color: "#1E2A4F", marginBottom: 8 }}>SELF-AI'a Hoş Geldiniz</h3>
               <p style={{ color: "#666", fontSize: 16 }}>İncelemek istediğiniz içeriği sol menüden seçebilirsiniz.</p>
             </div>
          ) : activeCategory === 'glossary' ? (
             <GlossaryView darkMode={darkMode} />
          ) : (
             <div style={{ paddingTop: 16 }}>
                <div style={styles.toolbar}>
                  <span style={styles.resultInfo}>{filtered.length} tool(s) found (araç bulundu)</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.sortSelect}>
                    <option value="date">By Date (Tarihe Göre)</option>
                    <option value="title">By Name (Ada Göre)</option>
                  </select>
                </div>

                <div style={styles.grid}>
                  {filtered.map(item => (
                    <ToolCard
                      key={item.id}
                      item={item}
                      isFav={favorites.includes(item.id)}
                      onToggleFav={() => toggleFav(item.id)}
                      onEdit={() => setEditingItem(item)}
                      onShowDetail={item.id === 'guide_004' ? () => setShowNotebookLM(true) : null}
                    />
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div style={styles.empty}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>◌</div>
                    <div>No tools found (Araç bulunamadı)</div>
                  </div>
                )}
             </div>
          )}
        </main>
      </div>
      </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TOOL CARD
// ═══════════════════════════════════════════════════════════
function ToolCard({ item, isFav, onToggleFav, onEdit, onShowDetail }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
  const hasGH = item.links?.github;
  const hasHF = item.links?.huggingface;

  // Construct all links with short names
  const allLinks = [];
  if (hasGH) allLinks.push({ url: item.links.github, label: "GitHub" });
  if (hasHF) allLinks.push({ url: item.links.huggingface, label: "HuggingFace" });

  if (item.links?.other) {
    item.links.other.forEach(l => {
      const isObj = typeof l === 'object' && l !== null;
      let url = isObj ? l.url : l;
      let label = isObj && l.label
        ? l.label.replace(/^Alternatif\s*[—–-]\s*/i, "").replace(/\s*\(.*?\)\s*/g, " ").trim()
        : null;
      allLinks.push({ url, label });
    });
  }

  // Final processing for ALL links
  const processedLinks = allLinks.map(linkObj => {
    let { url, label } = linkObj;
    let tooltip = null;

    try {
      let domain = new URL(url).hostname.replace(/^www\./, "");
      
      if (!label) {
         if (domain.includes('youtube.com') || domain.includes('youtu.be')) label = 'YouTube';
         else if (domain.includes('github.com')) label = 'GitHub';
         else if (domain.includes('huggingface.co')) label = 'HuggingFace';
         else if (domain.includes('scaler.com')) label = 'Scaler';
         else if (domain.includes('freecodecamp.org')) label = 'freeCodeCamp';
         else if (domain.includes('saylor.org')) label = 'Saylor';
         else if (domain.includes('microsoft.com')) label = 'Microsoft';
         else if (domain.includes('alison.com')) label = 'Alison';
         else if (domain.includes('cognitiveclass.ai')) label = 'CognitiveClass';
         else if (domain.includes('simplilearn.com')) label = 'Simplilearn';
         else if (domain.includes('openclassrooms.com')) label = 'OpenClassrooms';
         else if (domain.includes('google.com')) label = 'Google';
         else if (domain.includes('tableau.com')) label = 'Tableau';
         else if (domain.includes('mongodb.com')) label = 'MongoDB';
         else if (domain.includes('confluent.io')) label = 'Confluent';
         else if (domain.includes('redis.io')) label = 'Redis';
         else if (domain.includes('nyu.edu')) label = 'NYU';
         else if (domain.includes('silverchair.com')) label = 'Silverchair';
         else {
             let mainPart = domain.split('.')[0];
             label = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
         }
      }

      // If it's YouTube, extract the video ID
      if (domain.includes('youtube.com') || domain.includes('youtu.be') || label === 'YouTube') {
          label = 'YouTube';
          const u = new URL(url);
          if (u.hostname.includes('youtu.be')) {
              tooltip = "watch?v=" + u.pathname.slice(1);
          } else if (u.searchParams.has('v')) {
              tooltip = "watch?v=" + u.searchParams.get('v');
          } else if (u.searchParams.has('list')) {
              tooltip = "list=" + u.searchParams.get('list');
          } else if (u.pathname.startsWith('/shorts/')) {
              tooltip = "shorts/" + u.pathname.split('/')[2];
          }
      }

    } catch (e) {
      if (!label) label = "Link";
    }

    return { url, label, tooltip };
  });

  return (
    <div style={styles.card}>
      {/* Top row: Title (left) + Category & Fav (right) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ ...styles.cardTitle, margin: 0, flex: 1 }}>{item.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ ...styles.cardCat, fontSize: 11.5 }}>
            {cat.icon} {cat.name.split(" (")[0]}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} style={styles.favBtn}>
            {isFav ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div style={styles.cardDesc}>
        <GlossaryText text={item.description} />
      </div>

      {item.note && (
        <div style={styles.cardNote}>
          ℹ {item.note}
        </div>
      )}

      {/* Bottom row: Links (wrapped) + Edit button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", gap: 8 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
          {processedLinks.map((link, i) => (
            <LinkWithTooltip key={i} link={link} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {onShowDetail && (
            <button onClick={onShowDetail} style={{ ...styles.editBtn, background: "#1E2A4F" }}>📄 Detay</button>
          )}
          <button onClick={onEdit} style={{ ...styles.editBtn, flexShrink: 0 }}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function LinkWithTooltip({ link }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={link.url} target="_blank" rel="noreferrer" style={{ ...styles.linkChip, whiteSpace: "nowrap", display: "inline-block" }}>
        {link.label} ↗
      </a>
      {isHovered && link.tooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '6px',
          background: '#000',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          zIndex: 10,
          pointerEvents: 'none',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          {link.tooltip}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-4px',
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#000 transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// IMPORT MODAL
// ═══════════════════════════════════════════════════════════
function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState("");
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setText(ev.target.result);
    r.readAsText(f);
  };
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHead}>
          <h2 style={styles.modalTitle}>Import JSON (JSON İçe Aktar)</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <p style={styles.modalInfo}>
          Upload a JSON file or paste JSON data below. Duplicates will be automatically skipped.
          <br /><span style={{ color: "#9FB6CF" }}>(JSON dosyası yükleyin veya yapıştırın. Tekrar edenler otomatik atlanır.)</span>
        </p>
        <div style={styles.fileArea}>
          <input type="file" accept=".json" onChange={handleFile} id="importFile" style={{ display: "none" }} />
          <label htmlFor="importFile" style={styles.fileLabel}>Choose File (Dosya Seç)</label>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder='[{"title": "...", "description": "..."}]' style={styles.textArea} rows={8} />
        <div style={styles.modalFoot}>
          <button onClick={onClose} style={styles.btnCancel}>Cancel (İptal)</button>
          <button onClick={() => onImport(text)} style={styles.btnPrimary} disabled={!text.trim()}>Import (İçe Aktar)</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════
function AddModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("other");
  const [github, setGithub] = useState("");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHead}>
          <h2 style={styles.modalTitle}>Add Tool (Araç Ekle)</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <Field label="Title (Başlık)" value={title} onChange={setTitle} />
        <Field label="Description (Açıklama)" value={desc} onChange={setDesc} multiline />
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Category (Kategori)</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={styles.fieldInput}>
            {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Field label="GitHub URL" value={github} onChange={setGithub} placeholder="https://github.com/..." />
        <div style={styles.modalFoot}>
          <button onClick={onClose} style={styles.btnCancel}>Cancel</button>
          <button
            disabled={!title.trim()}
            onClick={() => onAdd({
              id: `m_${Date.now()}`, title, description: desc, category,
              links: { github }, status: "active", note: "",
              added: new Date().toISOString().slice(0, 10)
            })}
            style={styles.btnPrimary}
          >Add (Ekle)</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════
function EditModal({ item, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(item.title || "");
  const [desc, setDesc] = useState(item.description || "");
  const [category, setCategory] = useState(item.category || "other");
  const [note, setNote] = useState(item.note || "");
  const [github, setGithub] = useState(item.links?.github || "");
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHead}>
          <h2 style={styles.modalTitle}>Edit (Düzenle)</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <Field label="Title (Başlık)" value={title} onChange={setTitle} />
        <Field label="Description (Açıklama)" value={desc} onChange={setDesc} multiline />
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Category (Kategori)</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={styles.fieldInput}>
            {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Field label="GitHub URL" value={github} onChange={setGithub} />
        <Field label="Note (Not)" value={note} onChange={setNote} multiline placeholder="e.g. Replaced by a better tool... (Daha iyi bir alternatif var...)" />
        <div style={{ ...styles.modalFoot, justifyContent: "space-between" }}>
          {confirmDel ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#D7A6A3", fontSize: 13 }}>Are you sure? (Emin misin?)</span>
              <button onClick={onDelete} style={styles.btnDanger}>Yes, Delete</button>
              <button onClick={() => setConfirmDel(false)} style={styles.btnCancel}>No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={styles.btnDanger}>Delete (Sil)</button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={styles.btnCancel}>Cancel</button>
            <button onClick={() => onSave({ title, description: desc, category, note, links: { ...item.links, github } })} style={styles.btnPrimary}>Save (Kaydet)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NOTEBOOKLM DETAIL PAGE
// ═══════════════════════════════════════════════════════════
function NotebookLMDetailPage({ onClose }) {
  const [openPrompts, setOpenPrompts] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const togglePrompt = (id) => {
    setOpenPrompts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    NOTEBOOKLM_CONTENT.prompts.forEach(p => { all[p.id] = true; });
    setOpenPrompts(all);
  };

  const collapseAll = () => setOpenPrompts({});

  const copyPrompt = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const nlmStyles = {
    page: {
      position: "fixed", inset: 0, background: "#F0EFEC", zIndex: 300,
      display: "flex", flexDirection: "column", overflow: "hidden",
      height: "100vh", width: "100vw",
    },
    header: {
      background: "#fff", borderBottom: "1px solid #E5E4E1",
      padding: "16px 28px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexShrink: 0,
    },
    content: {
      flex: "1 1 auto", minHeight: 0, overflow: "auto", padding: "24px 28px",
    },
    inner: {
      maxWidth: 880, margin: "0 auto",
    },
    introBox: {
      background: "#E6E5E2", borderRadius: 14, padding: "20px 24px",
      border: "3px solid #BFBEBB", marginBottom: 20,
    },
    stepsBox: {
      background: "#fff", borderRadius: 12, padding: "16px 20px",
      border: "1px solid #E5E4E1", marginBottom: 24,
    },
    promptCard: {
      background: "#fff", borderRadius: 12, border: "1px solid #E5E4E1",
      marginBottom: 10, overflow: "hidden", transition: "all 0.2s",
    },
    promptHeader: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px", cursor: "pointer", gap: 12,
      transition: "background 0.15s",
    },
    promptNum: {
      background: "#1E2A4F", color: "#fff", borderRadius: 8,
      width: 32, height: 32, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0,
    },
    promptTitle: {
      flex: 1, fontSize: 14, fontWeight: 600, color: "#2a2a2a", margin: 0,
    },
    promptBody: {
      padding: "0 18px 18px", borderTop: "1px solid #F0EFEC",
    },
    promptCode: {
      background: "#1E2A4F", color: "#E8E8EC", borderRadius: 10,
      padding: "14px 16px", fontSize: 13, lineHeight: 1.6,
      fontFamily: "'Fira Code', 'Consolas', monospace",
      whiteSpace: "pre-wrap", position: "relative", marginBottom: 12,
    },
    copyBtn: {
      position: "absolute", top: 8, right: 8,
      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600,
      color: "#B9C7D6", cursor: "pointer", fontFamily: "inherit",
    },
    tag: {
      display: "inline-block", fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: 6, marginRight: 6, marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 18, fontWeight: 700, color: "#1E2A4F", marginTop: 32, marginBottom: 14,
      borderBottom: "2px solid #E5E4E1", paddingBottom: 8,
    },
    tipsCard: {
      background: "#E6E5E2", borderRadius: 14, padding: "18px 22px",
      border: "3px solid #BFBEBB", marginBottom: 16,
    },
    comboCard: {
      background: "#fff", borderRadius: 10, padding: "14px 18px",
      border: "1px solid #E5E4E1", marginBottom: 8,
    },
  };

  return (
    <div style={nlmStyles.page}>
      {/* Header */}
      <div style={nlmStyles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#2a2a2a" }}>
            📋 NotebookLM Pro Prompts <span style={{ fontWeight: 400, color: "#B7B8BF", fontSize: 14 }}>(16 Prompt)</span>
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999" }}>
            Gerçekten çalışan, kopyala-yapıştır yapılabilir NotebookLM prompt'ları — Türkçe açıklamalarla
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={expandAll} style={{
            background: "#F5F5F3", border: "1px solid #E5E4E1", borderRadius: 8,
            padding: "7px 14px", fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit",
          }}>Tümünü Aç</button>
          <button onClick={collapseAll} style={{
            background: "#F5F5F3", border: "1px solid #E5E4E1", borderRadius: 8,
            padding: "7px 14px", fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit",
          }}>Tümünü Kapat</button>
          <button onClick={onClose} style={{
            background: "#2C3040", color: "#B9C7D6", border: "none", borderRadius: 8,
            padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>✕ Kapat</button>
        </div>
      </div>

      {/* Content */}
      <div style={nlmStyles.content}>
        <div style={nlmStyles.inner}>

          {/* Intro */}
          <div style={nlmStyles.introBox}>
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#1E2A4F" }}>
              {NOTEBOOKLM_CONTENT.intro.title}
            </h3>
            <div style={{ fontSize: 14, color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {NOTEBOOKLM_CONTENT.intro.text}
            </div>
          </div>

          {/* How to use */}
          <div style={nlmStyles.stepsBox}>
            <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#2a2a2a" }}>
              {NOTEBOOKLM_CONTENT.howToUse.title}
            </h4>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {NOTEBOOKLM_CONTENT.howToUse.steps.map((step, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 4 }}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Prompts */}
          <h3 style={nlmStyles.sectionTitle}>🎯 16 Prompt</h3>

          {NOTEBOOKLM_CONTENT.prompts.map(p => (
            <div key={p.id} style={{
              ...nlmStyles.promptCard,
              ...(openPrompts[p.id] ? { border: "2px solid #9FB6CF", boxShadow: "0 2px 12px rgba(159,182,207,0.15)" } : {})
            }}>
              <div
                onClick={() => togglePrompt(p.id)}
                style={{
                  ...nlmStyles.promptHeader,
                  background: openPrompts[p.id] ? "#FAFBFC" : "transparent",
                }}
              >
                <span style={nlmStyles.promptNum}>{p.id}</span>
                <p style={nlmStyles.promptTitle}>{p.title}</p>
                <span style={{ fontSize: 18, color: "#B7B8BF", transition: "transform 0.2s", transform: openPrompts[p.id] ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
              </div>

              {openPrompts[p.id] && (
                <div style={nlmStyles.promptBody}>
                  {/* What */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ ...nlmStyles.tag, background: "#E8F0FE", color: "#1E2A4F" }}>Ne İşe Yarar</span>
                    <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#444", lineHeight: 1.65 }}>{p.what}</p>
                  </div>

                  {/* When */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ ...nlmStyles.tag, background: "#FFF3E0", color: "#8B5A2B" }}>Ne Zaman Kullanılır</span>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666", lineHeight: 1.6 }}>{p.when}</p>
                  </div>

                  {/* Prompt code */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ ...nlmStyles.tag, background: "#E8F5E9", color: "#2E7D32" }}>Prompt</span>
                    <div style={nlmStyles.promptCode}>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyPrompt(p.prompt, p.id); }}
                        style={nlmStyles.copyBtn}
                      >
                        {copiedId === p.id ? "✓ Kopyalandı!" : "📋 Kopyala"}
                      </button>
                      {p.prompt}
                    </div>
                  </div>

                  {/* Why */}
                  <div style={{ marginBottom: p.note ? 12 : 0 }}>
                    <span style={{ ...nlmStyles.tag, background: "#F3E5F5", color: "#6A1B9A" }}>Neden Çalışır</span>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>{p.why}</p>
                  </div>

                  {/* Note */}
                  {p.note && (
                    <div style={{
                      background: "#FFF8E1", border: "1px solid #FFE0B2", borderRadius: 8,
                      padding: "8px 12px", fontSize: 12, color: "#8B5A2B", lineHeight: 1.5,
                    }}>
                      ⚠️ {p.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Tips Section */}
          <h3 style={nlmStyles.sectionTitle}>💡 İpuçları ve Öneriler</h3>

          {/* Patterns */}
          <div style={nlmStyles.tipsCard}>
            <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#1E2A4F" }}>
              {NOTEBOOKLM_CONTENT.tips.title}
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {NOTEBOOKLM_CONTENT.tips.patterns.map((p, i) => (
                <li key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 3 }}>→ {p}</li>
              ))}
            </ul>
          </div>

          {/* Usage scenarios */}
          <div style={nlmStyles.stepsBox}>
            <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#2a2a2a" }}>
              {NOTEBOOKLM_CONTENT.tips.usage.title}
            </h4>
            {NOTEBOOKLM_CONTENT.tips.usage.scenarios.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: "#1E2A4F", minWidth: 130 }}>{s.case}:</span>
                <span style={{ color: "#555" }}>{s.suggestion}</span>
              </div>
            ))}
          </div>

          {/* Problems & Fixes */}
          <h3 style={nlmStyles.sectionTitle}>🔧 Sorunlar ve Çözümleri</h3>
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#1E2A4F" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "#B9C7D6", fontWeight: 600, borderRadius: "10px 0 0 0" }}>Sorun</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "#B9C7D6", fontWeight: 600, borderRadius: "0 10px 0 0" }}>Çözüm</th>
                </tr>
              </thead>
              <tbody>
                {NOTEBOOKLM_CONTENT.tips.problems.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF8" : "#fff" }}>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #EDEDEB", color: "#D7A6A3", fontWeight: 600 }}>"{p.problem}"</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #EDEDEB", color: "#555" }}>{p.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Combos */}
          <h3 style={nlmStyles.sectionTitle}>🔗 Birlikte Kullanılacak Prompt Kombinasyonları</h3>
          {NOTEBOOKLM_CONTENT.tips.combos.map((combo, i) => (
            <div key={i} style={nlmStyles.comboCard}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1E2A4F", marginBottom: 8 }}>
                {combo.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {combo.steps.map((step, j) => (
                  <span key={j} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      background: "#E8F0FE", color: "#1E2A4F", padding: "4px 10px",
                      borderRadius: 6, fontSize: 12, fontWeight: 600,
                    }}>{step}</span>
                    {j < combo.steps.length - 1 && <span style={{ color: "#B7B8BF", fontSize: 16 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Source */}
          <div style={{
            textAlign: "center", padding: "24px 0 12px", fontSize: 12, color: "#B7B8BF",
          }}>
            Kaynak: <a href="https://www.godofprompt.ai/blog/15-notebooklm-prompts-that-actually-work-copy-paste-done" target="_blank" rel="noreferrer" style={{ color: "#9FB6CF" }}>godofprompt.ai</a>
          </div>

        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GLOSSARY VIEW
// ═══════════════════════════════════════════════════════════
function GlossaryView({ darkMode }) {
  const hashLetter = window.location.hash.replace('#glossary-', '').replace('#glossary', '');
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(hashLetter.length === 1 ? hashLetter.toUpperCase() : null);

  const allTerms = Object.entries(GLOSSARY).sort((a, b) => a[0].localeCompare(b[0]));

  // Get available letters
  const availableLetters = [...new Set(allTerms.map(([k]) => k[0].toUpperCase()))].sort();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Filter
  const filtered = allTerms.filter(([k, v]) => {
    const matchSearch = !search || k.toLowerCase().includes(search.toLowerCase()) || v.desc.toLowerCase().includes(search.toLowerCase()) || v.tr.toLowerCase().includes(search.toLowerCase());
    const matchLetter = !activeLetter || k[0].toUpperCase() === activeLetter;
    return matchSearch && matchLetter;
  });

  // Sync active letter to URL hash
  useEffect(() => {
    window.location.hash = activeLetter ? `glossary-${activeLetter}` : 'glossary';
  }, [activeLetter]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", width: "100%", gap: 16
    }}>
      {/* Sticky Header and Alphabet Bar */}
      <div style={{
        position: "sticky",
        top: 75, // Aligned just under the main app banner
        zIndex: 10,
        background: darkMode ? "#1A1C24" : "#F0EFEC", // Match the app background for seamless blend
        paddingBottom: 16,
        paddingTop: 16,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Alphabet Bar */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap",
        }}>
          <button
            onClick={() => setActiveLetter(null)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", border: "1px solid",
              background: !activeLetter ? (darkMode ? "#E2B8B6" : "#1E2A4F") : (darkMode ? "#22242E" : "#fff"),
              color: !activeLetter ? (darkMode ? "#1A1C24" : "#fff") : (darkMode ? "#8A8E9A" : "#555"),
              borderColor: !activeLetter ? (darkMode ? "#E2B8B6" : "#1E2A4F") : (darkMode ? "#2C3040" : "#E5E4E1"),
              transition: "all 0.2s"
            }}
          >TÜMÜ</button>
          {alphabet.map(letter => {
            const hasTerms = availableLetters.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => hasTerms && setActiveLetter(activeLetter === letter ? null : letter)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: hasTerms ? "pointer" : "default", fontFamily: "inherit",
                  border: "1px solid",
                  background: activeLetter === letter ? (darkMode ? "#E2B8B6" : "#1E2A4F") : hasTerms ? (darkMode ? "#22242E" : "#fff") : (darkMode ? "#1A1C24" : "#F5F5F3"),
                  color: activeLetter === letter ? (darkMode ? "#1A1C24" : "#fff") : hasTerms ? (darkMode ? "#8A8E9A" : "#555") : (darkMode ? "#4A4D59" : "#D0D0D0"),
                  borderColor: activeLetter === letter ? (darkMode ? "#E2B8B6" : "#1E2A4F") : hasTerms ? (darkMode ? "#2C3040" : "#E5E4E1") : (darkMode ? "#22242E" : "#EDEDEB"),
                  opacity: hasTerms ? 1 : 0.6,
                  transition: "all 0.2s"
                }}
              >{letter}</button>
            );
          })}
        </div>
        
        {/* Search Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Terim ara (Search terms)..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
            style={{
              padding: "10px 16px", background: darkMode ? "#22242E" : "#fff",
              border: `1px solid ${darkMode ? "#2C3040" : "#E5E4E1"}`,
              color: darkMode ? "#D0D0D6" : "#3a3a3a",
              borderRadius: 10, fontSize: 13, outline: "none", width: 260,
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gap: 16 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#999", fontSize: 16 }}>
            Terim bulunamadı.
          </div>
        )}
        {filtered.map(([key, data]) => {
          const isAbbrev = key === key.toUpperCase();
          return (
            <div key={key} style={{...styles.card, ...(darkMode ? { background: "#22242E", borderColor: "#2C3040" } : {}) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ ...styles.cardTitle, ...(darkMode ? { color: "#D0D0D6" } : {}), margin: 0, flex: 1 }}>{key}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ ...styles.cardCat, ...(darkMode ? { color: "#E2B8B6" } : {}), fontSize: 11.5 }}>
                    📖 {isAbbrev && data.tr ? `${data.short} (${data.tr})` : data.short}
                  </span>
                </div>
              </div>
              <div style={{ ...styles.cardDesc, ...(darkMode ? { color: "#9EA1AD" } : {}) }}>
                {data.desc}
              </div>
              {data.example && (
                <div style={{
                  background: darkMode ? "#2A2528" : "#fff", borderRadius: 8,
                  padding: "12px 16px", fontSize: 14, color: darkMode ? "#B7B8BF" : "#555",
                  lineHeight: 1.6, borderLeft: `4px solid ${darkMode ? "#D7A6A3" : "#1E2A4F"}`,
                }}>
                  <span style={{ fontWeight: 700, color: darkMode ? "#E2B8B6" : "#1E2A4F", marginRight: 6 }}>Örnek:</span>{data.example}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI MAP VIEW
// ═══════════════════════════════════════════════════════════
function AiMapView({ darkMode }) {
  // Use a negative margin strategy instead of layout-altering overflows 
  // on the app's structural flex containers. We'll give it the exact screen
  // height minus the header (75px) minus the body's bottom padding (60px) -> calc(100vh - 135px)
  return (
    <div style={{ margin: "0 -24px -60px -24px", background: "#F5F4EF" }}>
      <iframe
        src="/ai_datasheet2.html"
        style={{ width: '100%', height: 'calc(100vh - 75px)', border: 'none', display: 'block', background: 'transparent' }}
        title="AI Yol Haritası"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FIELD COMPONENT
// ═══════════════════════════════════════════════════════════
function Field({ label, value, onChange, multiline, placeholder }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...styles.fieldInput, minHeight: 72, resize: "vertical" }} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} style={styles.fieldInput} placeholder={placeholder} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = {
  app: {
    minHeight: "100vh",
    background: "#F0EFEC",
    color: "#3a3a3a",
    fontFamily: "'DM Sans', 'Nunito', -apple-system, sans-serif",
  },

  // ─── START PAGE ───
  startPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#F5F5F3",
    color: "#333",
    boxSizing: "border-box",
  },
  startTitle: {
    fontSize: 48,
    fontWeight: 800,
    color: "#1E2A4F",
    marginBottom: 32,
    letterSpacing: "-1px",
    textAlign: "center",
  },
  startImage: {
    width: "100%",
    maxWidth: 207, // 180px'in %15 fazlası
    height: "auto",
    borderRadius: 16,
    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
    marginBottom: 40,
    border: "4px solid #fff",
  },
  startContent: {
    maxWidth: 720,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#4A4A4A",
    textAlign: "justify",
    marginBottom: 48,
  },
  startEnterBtn: {
    background: "#1E2A4F",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "16px 48px",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(30,42,79,0.2)",
    transition: "all 0.2s ease",
    letterSpacing: "1px",
  },

  // ─── HEADER ───
  header: {
    background: "#fff",
    borderBottom: "1px solid #E5E4E1",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  logoArea: { display: "flex", flexDirection: "column", gap: 0 },
  logo: {
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
    color: "#3a3a3a",
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  logoAccent: { color: "#9FB6CF" },
  subtitle: { fontSize: 11, color: "#B7B8BF", fontWeight: 400, marginTop: 2 },
  headerActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  btnAction: {
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#555",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  btnGlossary: {
    background: "#F5F0EB",
    border: "1px solid #E2B8B6",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#8a6a68",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // ─── TOAST ───
  toast: {
    position: "fixed",
    top: 16,
    right: 16,
    padding: "10px 20px",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  // ─── BODY ───
  body: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0px 24px 60px",
    display: "flex",
    gap: 28,
  },

  // ─── SIDEBAR ───
  sidebar: {
    width: 252,
    flexShrink: 0,
    position: "sticky",
    top: 75,
    paddingTop: 16,
    height: "fit-content",
    maxHeight: "calc(100vh - 100px)",
    overflowY: "auto",
  },
  searchWrap: { position: "relative", marginBottom: 14 },
  searchIcon: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#B7B8BF", fontSize: 16 },
  searchInput: {
    width: "100%",
    padding: "9px 30px 9px 30px",
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 10,
    color: "#3a3a3a",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#B7B8BF", cursor: "pointer", fontSize: 13,
  },
  favFilter: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 10,
    color: "#777",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 18,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  favFilterActive: {
    background: "#FFF8F0",
    borderColor: "#D7A6A3",
    color: "#D7A6A3",
  },
  catList: {
    maxHeight: "calc(100vh - 280px)",
    overflowY: "auto",
    paddingRight: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
    paddingLeft: 4,
  },
  catBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 10,
    color: "#666",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "all 0.12s",
    marginBottom: 6,
    boxSizing: "border-box",
  },
  catBtnActive: {
    background: "#000000",
    color: "#ffffff",
    fontWeight: 600,
    borderColor: "#000000",
  },
  catCount: { fontSize: 12, color: "#B7B8BF", minWidth: 22, textAlign: "right", fontWeight: 600 },

  // ─── MAIN ───
  main: { flex: 1, minWidth: 0 },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultInfo: { fontSize: 13, color: "#B7B8BF" },
  sortSelect: {
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    color: "#777",
    outline: "none",
    fontFamily: "inherit",
  },

  // ─── GRID ───
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  // ─── CARD ───
  card: {
    background: "#E6E5E2",
    border: "3px solid #BFBEBB",
    borderRadius: 14,
    padding: "16px 20px", // Adjusted padding for 3px border
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    cursor: "default",
    width: "100%",
    boxSizing: "border-box",
  },
  cardTop: {
    display: "none",
  },
  cardCat: {
    fontSize: 11,
    fontWeight: 700,
    color: "#8B5A2B", // Brown color for category titles
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  favBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#E2B8B6",
    padding: 0,
    lineHeight: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#000000",
    margin: 0,
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 1.6,
    textAlign: "justify",
  },
  cardNote: {
    background: "rgba(215,166,163,0.12)",
    border: "1px solid rgba(226,184,182,0.25)",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    color: "#E2B8B6",
  },
  cardLinks: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 2,
  },
  linkChip: {
    fontSize: 11.5,
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: 6,
    background: "#ffffff",
    border: "1px solid #000000",
    color: "#000000",
    textDecoration: "none",
    transition: "all 0.12s",
  },
  cardDate: { fontSize: 11, color: "#5E6270" },
  editBtn: {
    background: "#2C3040",
    border: "1px solid #3A3E50",
    borderRadius: 6,
    padding: "3px 12px",
    fontSize: 11.5,
    fontWeight: 600,
    color: "#E8E8EC",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.12s ease",
  },

  // ─── EMPTY ───
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#CFCFD4",
    fontSize: 14,
  },

  // ─── GLOSSARY TERM ───
  glossaryTerm: {
    borderBottom: "1.5px dotted #8B0000",
    cursor: "help",
    color: "#8B0000",
    fontWeight: 600,
  },

  // ─── TOOLTIP ───
  tooltip: {
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 12,
    padding: "14px 16px",
    width: 340,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#3a3a3a",
    boxSizing: "border-box", // Ensure padding is included in the 340px width
  },
  tooltipHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tooltipShort: { fontSize: 11, color: "#9FB6CF", fontStyle: "italic" },
  tooltipTr: { fontSize: 12, color: "#D7A6A3", marginBottom: 6 },
  tooltipDesc: { margin: "0 0 8px", color: "#555" },
  tooltipExample: {
    background: "#F8F8F6",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
    color: "#666",
    lineHeight: 1.5,
  },
  tooltipRelated: {
    fontSize: 11,
    color: "#B7B8BF",
    marginTop: 8,
  },

  // ─── GLOSSARY CARD ───
  glossaryCard: {
    background: "#FAFAF8",
    border: "1px solid #EDEDEB",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 10,
  },
  glossaryCardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  glossaryShort: { fontSize: 11, color: "#9FB6CF", fontStyle: "italic" },
  glossaryExample: {
    background: "#fff",
    border: "1px solid #EDEDEB",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
    color: "#666",
    lineHeight: 1.5,
  },

  // ─── MODAL ───
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: 20,
  },
  modal: {
    background: "#fff",
    border: "1px solid #E5E4E1",
    borderRadius: 16,
    padding: 28,
    maxWidth: 520,
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: "#2a2a2a", margin: 0 },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#B7B8BF",
    fontSize: 18,
    cursor: "pointer",
  },
  modalInfo: { fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 16 },
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 20,
  },

  // ─── FORM FIELDS ───
  field: { marginBottom: 14 },
  fieldLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
    marginBottom: 4,
  },
  fieldInput: {
    width: "100%",
    padding: "8px 12px",
    background: "#FAFAF8",
    border: "1px solid #E5E4E1",
    borderRadius: 8,
    color: "#3a3a3a",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  fileArea: { marginBottom: 12 },
  fileLabel: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#FAFAF8",
    border: "1.5px dashed #CFCFD4",
    borderRadius: 10,
    color: "#888",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  textArea: {
    width: "100%",
    padding: "8px 12px",
    background: "#FAFAF8",
    border: "1px solid #E5E4E1",
    borderRadius: 8,
    color: "#3a3a3a",
    fontSize: 13,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  // ─── BUTTONS ───
  btnPrimary: {
    background: "#9FB6CF",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnCancel: {
    background: "#F5F5F3",
    color: "#888",
    border: "1px solid #E5E4E1",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnDanger: {
    background: "#FFF0EE",
    color: "#D7A6A3",
    border: "1px solid #E2B8B6",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

# GitHub Profil Analizörü - Proje Rehberi

## Adım 1: Temel İskelet, Bootstrap ve Dark Mode Kurulumu (`index.html`)

### 1. Neden `data-bs-theme="dark"` kullandık?
Bootstrap 5.3 ve sonrası, HTML tag'ine eklenen tek bir attribute ile global "Dark Mode" (Koyu Tema) desteği sunar. Bu sayede manuel olarak onlarca class (sınıf) yazmakla uğraşmak yerine ana yapının varsayılan olarak minimal ve koyu temalı olmasını tek hareketle sağladık.

### 2. Footer'ın Her Zaman Altta Kalması (`min-vh-100` ve `flex-grow-1`)
Öğrencilerin en sık karşılaştığı HTML/CSS hatalarından biri, içerik az olduğunda Footer'ın (sayfa alt bilgisinin) ekranın ortasında havada kalmasıdır.
`<body>` etiketine verdiğimiz `min-vh-100` (ekran genişliğinin %100'ü) ve flexbox yapısı sayesinde body her zaman minimum ekran boyutunu kaplar. `<main>` etiketine verdiğimiz `flex-grow-1` ile de ana içerik alanı arta kalan tüm boşluğu kaplayarak Footer'ı dibe iter. Ana sayfanın `justify-content-center` özelliği arama kutusunu da tam merkeze yerleştirir.

### 3. CDN Nedir ve Neden Kullanıyoruz?
Projeye Bootstrap'i dahil ederken bir dosya indirip bilgisayarımızda tutmak yerine CDN (Content Delivery Network) formatında linkledik (CSS için `<head>` içine, JS için `<body>` etiketinin bitimine hemen önce).
1. Proje boyutunu ufaltır, klasörleri temiz tutar.
2. Tarayıcıda (browser cache) başka bir projeden Bootstrap önbelleğe alınmışsa, sitemiz anında yüklenir. JS dosyalarının `</body>` etiketinden hemen önce yazılması ise sayfa hiyerarşisinde elementlerin önce, animasyon eventlerinin sonra yüklenmesini sağlar ki bu performansı artırır.

### 4. Arama Kutusu ve `input-group`
Bootstrap'in `<div class="input-group">` özelliği, bir @ işareti, bir yazı alanı ve bir butonu kolayca ve çok estetik bir biçimde yan yana entegre etmemize yarar.
Arama modülüne şimdiden `#searchInput` (input ID) ve `#searchBtn` (button ID) verdik. Bu sayede JavaScript aşamasına geldiğimizde Document Object Model (DOM) üzerinden bu elementleri kolaylıkla manipüle edip yakalayabileceğiz. Seçimlerimiz rastgele değil, sonraki JS adımları için ön hazırlıktır.

## Adım 2: Alt Sayfalar ve Form Hazırlığı

### 1. Sayfa Hiyerarşisi ve Routing (Yönlendirme) Eksikliği
Bootstrap entegrasyonu tamamlandıktan sonra aynı *Navbar* ve *Footer* yapılarını koruyarak projemize `ozellikler.html`, `hakkimizda.html` ve `iletisim.html` olmak üzere üç yeni HTML dosyası daha ekledik. Modern frameworklerde (React, Vue vb.) bu yapılar tek bir bileşen olarak yönetilirken, Vanilla HTML'de bunları mecburen kopyaladık. Her sayfada `nav-link active` sınıfını ilgili bağlantıya taşıyarak kullanıcının hangi ekranda olduğunu vurguladık.

### 2. İletişim Formu ve Veri Doğrulama (Validation) Altyapısı
`iletisim.html` sayfasında `.form-control` ve `.form-label` Bootstrap yapılarını oluşturduk. Orada formdaki **Input** (İsim, E-posta) ve **Textarea** (Mesaj) elemanlarına ve butona özel HTML `id` özellikleri (`nameInput`, `emailInput`, `messageInput`, `submitBtn`) atadık.

Bunun en büyük sebebi, projemizin ilerleyen adımlarında **Form Doğrulama (Form Validation)** uygulayacak olmamızdır. JavaScript kullanarak bu elemanların değerini seçecek ve e-posta formunda uygun format var mı veya ad soyad alanı boş kalarak "Gönder" butonuna tıklandı mı diye analiz edebileceğiz. HTML yapısında ID vermek, sonradan yazılacak JS kodunun ilk adımıdır.

## Adım 3: SaaS Tasarım ve UX (Kullanıcı Deneyimi) İyileştirmeleri

Tasarımımızı statik bir yapıdan kurtarıp modern bir SaaS (Yazılım Hizmeti) hissiyatı vermek için şu CSS/HTML dokunuşlarını gerçekleştirdik:

1. **Tipografi ve Boşluklar (Whitespace):** Google Fonts üzerinden `Inter` fontunu ekleyerek tipografiyi daha temiz ve modern hale getirdik. `<main>` elementine `min-height: 80vh;` vererek arama alanını sayfanın tam ortasına, mükemmel bir dikey hizalamayla (`justify-content-center`) yerleştirdik ve elementler arasına `gap` ile boşluk sağladık.
2. **Derinlik ve Renk Paleti:** Klasik düz siyah yerine arka planda daha derin bir lacivert/koyu gri (`#0f172a`) kullanıldı. Bu, gözü yormayan premium bir "Dark Mode" standardıdır.
3. **Etkileşim (Interactivity) ve Glow:** Arama (input) kutusuna odaklanıldığında (focus) sınırlarını çevreleyen yumuşak bir parlama (`box-shadow` temelli glow) efekti eklendi. Arama butonuna gelindiğinde renginde hafif bir açılma ve `transform: translateY(-2px)` ile butona basılma hissiyatını destekleyen yukarı kayma animasyonu verildi. Kutu köşeleri `border-radius: 12px` ile daha yumuşak hatlara kavuşturuldu.
4. **Yüklenme Animasyonları (Keyframes):** Sayfa açıldığında öğelerin aniden belirmesi yerine `@keyframes fadeInUp` animasyonu eklendi. Ana başlık ve arama alanı aşağıdan yukarı kayarak ve saydamdan (opacity: 0) görünüre geçecek şekilde tasarlandı. İkinci öğeye (arama kutusu) `animation-delay` verilerek sıralı, göze çok daha profesyonel gözüken bir giriş efekti elde edildi.

## Adım 4: Monokrom Tema, Bento Box ve LocalStorage ile Dark/Light Mode

Tasarımımızı tam bir minimalizme, saf Siyah-Beyaz (Monokrom) sadeliğine taşıdık. Ayrıca "Hakkımızda" sayfasını **Bento Box** denen parçalı grid asimetrisiyle kurduk. En büyük yazılımsal sıçramayı ise `app.js` içerisine tema sistemini ekleyerek yaptık:

### 1. `localStorage` ile Kalıcı Tercihler
Kullanıcı Ay/Güneş ikonuna tıkladığında hem sayfadaki `data-bs-theme` verisi değişiyor hem de `localStorage.setItem('app-theme', newTheme)` komutu ile tarayıcının yerel hafızasına bir tercih kaydediyoruz. Kullanıcı siteyi kapatıp uzun süre sonra geri döndüğünde, sayfa yüklenir yüklenmez (DOMContentLoaded) `localStorage.getItem('app-theme')` okuması yapıyor ve kullanıcının bıraktığı temada sayfayı açıyoruz.

### 2. CSS Custom Properties (Değişkenler)
Tüm renkleri `.btn`, `.card` içinde hardcoded vermek yerine `:root { --bg-color: #fff; ... }` şeklinde bir ana çatı kurduk. Koyu moda geçilip html tagı `[data-bs-theme="dark"]` olduğunda, sistem bu global değişkenleri otomatik karanlık renklere çekiyor ve tek tuşla sitemizin her yeri pürüzsüz ("transition") şekilde boyut değiştiriyor.

**Mentor Notu:** Ekstra renk vurgusu tarzını inceleyebilmeniz için projeye `tarz/apple-indigo-ornek.css` isimli ufak bir dosya eklendi. JavaScript arayüzdeki DOM ağacını yöneten asıl beyindir. Artık formlara geçiyoruz.

## Adım 5: Form Validation, SweetAlert2 ve JS Hesaplama Modülü (Hafta 8 Görevleri)

Hafta 8 izlencesini (syllabus) karşılamak üzere `index.html`'deki "Analiz Et" butonuna tıklandığında çalışacak JavaScript mantığını `app.js` içerisine kurduk. 

### 1. Butona Olay (Event) Ekleme
Butonu (`#searchBtn`) seçip `addEventListener('click', ...)` özelliği ile bir tetikleyici bağladık.

### 2. Form Validation (Veri Doğrulama)
Kullanıcı arama kutusunu (input) boş bırakıp düğmeye bastığında API'ye anlamsız bir istek gitmemesi gerekir. `.trim()` metoduyla metin içindeki gereksiz yan boşlukları silip, metnin boş olup olmadığını (`=== ""`) kontrol ettik. Eğer boşsa işlemi `return` kelimesiyle kesip kapattık. Aynı durum kullanıcı adındaki hatalı format (boşluk içerip içermediği vb.) kontrolü `includes(" ")` ile de yapıldı.

### 3. JS Eklentisi Entegre (SweetAlert2)
Kullanıcıya hata ve uyarıları göstermek için tarayıcının varsayılan, çirkin `alert()` kutusunu kullanmak yerine (web ortamınızı geliştiriniz gereksinimi dahilinde) çok modern animasyonlara sahip **SweetAlert2** JS kütüphanesini projemize dahil ettik. `Swal.fire()` metotlarıyla eklentiyi çalıştırdık. Hatta kodlarımızı temanızla (Light/Dark mode) entegre uyumlu olacak şekilde özel statik renk değerleriyle harmanladık.

### 4. Basit Hesaplama Modülü
Ajax yöntemiyle gerçek GitHub verilerini getirmeye (Hafta 10) gelmediğimiz için, sahte bir veri dönüşü hazırladık. JavaScript algoritmik becerisini göstermek adına `algoritmaHesapla()` metodunda bir kullanıcının ismindeki harf sayısını baz alan, matematik hesaplaması ve rastgele (`Math.random`) katsayılar ile bir deneyim (XP) puanı oluşturan modül ürettik.

### 5. DOM Manipülasyonu
Hesaplamalar başarılı olup SweetAlert bildirim animasyonu bitince (`.then()` senkronuyla) `innerHTML` yapısı kullanarak boş halde bekleyen `#resultsContainer` isimli div'in içine dinamik HTML, harika bir veri kartı (bento box UI) bastık. Arama sonrası ise kolaylık için input içini tekrar sıfırladık (`searchInput.value = ""`).

## Adım 6: Gerçek GitHub API — Fetch API, Async/Await, Promise.all

Projenin en kritik adımı: sahte veriyi bırakıp gerçek GitHub verisini çekiyoruz.

### 1. `async` / `await` nedir?

JavaScript'te bir fonksiyonun başına `async` yazarsak, o fonksiyon artık **asenkron** çalışır. İnternet üzerinden veri çekmek zaman alır — `await` anahtar kelimesi bize şunu söyler: "Bu iş bitene kadar bekle, ama sayfayı dondurmadan bekle."

```js
async function fetchGitHubUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
}
```

`fetch()` fonksiyonu bir **Promise** döner. `await` o Promise'in tamamlanmasını bekler ve sonucu değişkene atar.

### 2. `Promise.all()` ile paralel istek

Kullanıcı profili ve repoları için **iki ayrı API isteği** atmamız gerekiyor. Bunları sırayla atmak yerine aynı anda atıp ikisinin de bitmesini bekliyoruz:

```js
const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`)
]);
```

`Promise.all([...])` içine verilen tüm Promise'ler paralel çalışır. İkisi de bitince sonuçları **array destructuring** ile iki ayrı değişkene alıyoruz. Bu yaklaşım sıralı yapmaya göre **iki kat daha hızlı**.

### 3. `try / catch` ile hata yönetimi

Ağ çağrısı her zaman başarılı olmayabilir. Kullanıcı adı yanlış olabilir, internet kesik olabilir. `try/catch` bloğu bunu yakalar:

```js
try {
    // Başarılı senaryo
} catch (err) {
    // Hata senaryosu — sayfa çökmez, kullanıcıya bilgi verilir
}
```

`userRes.status === 404` kontrolü ise **HTTP durum kodu** okumadır. 404, "bulunamadı" anlamına gelir — GitHub API'si var olmayan bir kullanıcı için bunu döner.

### 4. Loading (Yüklenme) Göstergesi

API yanıt verene kadar ekran boş kalmamalı. `showLoading()` fonksiyonu Bootstrap'in `.spinner-border` bileşenini `innerHTML` ile `#resultsContainer`'a ekler. API bittikten sonra `profilGoster()` zaten `innerHTML`'i yeniden yazar, spinner otomatik kaybolur.

### 5. Enter Tuşu Desteği

`keydown` eventi klavyede basılan tuşu yakalar. `e.key === 'Enter'` kontrolü ile arama kutusundayken Enter'a basılınca `handleSearch()` çağrılır — buton aramaya gerek kalmaz.

---

## Adım 7: Repository Listesi — `.map()` ve DOM'a Ekleme

### 1. `.map()` ile dizi dönüştürme

GitHub API'den gelen `repos` bir **dizi (array)**. Her repo objesi için bir HTML string üretip yeni bir dizi elde ediyoruz:

```js
const repoCards = repos.map(repo => {
    return `<div class="col-md-6">...</div>`;
});
```

`.map()` orijinal diziyi değiştirmez, yeni bir dizi döner. Sonra `.join('')` ile tüm string'leri birleştirip tek bir HTML bloğu elde ediyoruz.

### 2. `+=` ile DOM'a ekleme

Profil kartını `innerHTML =` ile yazdık (sıfırdan). Repo bölümünü ise `innerHTML +=` ile **üstüne ekledik** — profil kartını silmeden devam ettik.

### 3. Dil renk haritası (getLangColor)

Her programlama dili için standart GitHub rengi bir obje içinde tutulur. `colors[lang]` ile dile karşılık gelen hex rengi alıp hem arka plan hem border için saydam versiyonlarını (`${color}20`, `${color}40`) kullandık. Bu CSS hex saydamlık kısaltmasıdır (son 2 karakter alpha değeridir).

### 4. Hata UI'ları (inline)

Hata mesajları için SweetAlert kullanmadık — çünkü API hataları kullanıcının tekrar denemesi gereken durumlar. Bunun yerine inline DOM kartları oluşturduk. Bu sayede kullanıcı sayfada kalır, kartı görebilir ve yeni bir arama yapabilir.

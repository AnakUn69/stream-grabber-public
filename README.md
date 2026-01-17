# 🎬 Stream Grabber

**Stream Grabber** je elegantní rozšíření pro prohlížeč Chrome, které automaticky detekuje a extrahuje přímé streamovací odkazy z webu `hellspy.to`. Nabízí bleskové kopírování odkazů a unikátní integraci s **Watch2Gether** pro okamžité společné sledování.

![UI Preview](icons/icon.png) *(Poznámka: Zde můžete doplnit screenshot popupu)*

## ✨ Klíčové funkce

- **Automatická detekce**: Okamžitě najde všechny dostupné kvality streamu na stránce.
- **Copy-and-Go**: Jedním kliknutím zkopírujete odkaz v požadované kvalitě do schránky.
- **W2G Integrace**: Automatické vytvoření místnosti na [Watch2Gether](https://w2g.tv) a vložení streamu.
- **Moderní UI**: Temný, přehledný a responzivní design inspirovaný moderními SaaS aplikacemi.
- **Bezpečné uložení**: Váš API klíč je bezpečně uložen v lokálním úložišti prohlížeče.

## 🚀 Instalace

1. Stáhněte si tento repozitář (jako ZIP nebo pomocí `git clone`).
2. Otevřete Chrome a přejděte na adresu `chrome://extensions/`.
3. V pravém horním rohu zapněte **Režim vývojáře** (Developer mode).
4. Klikněte na **Načíst nebalené rozšíření** (Load unpacked) a vyberte složku s tímto projektem.

## 📺 Použití Watch2Gether

Pro používání funkce "Otevřít W2G" je potřeba nastavit API klíč:
1. Klikněte na ikonu rozšíření Stream Grabber.
2. Klikněte na ikonu ozubeného kolečka (**⚙️**) v záhlaví.
3. Vložte svůj Watch2Gether API klíč (získáte ho ve svém W2G profilu v sekci "Edit Profile").
4. Klikněte na **Uložit**.

Nyní se u každého nalezeného streamu zobrazí tlačítko **W2G**, které rovnou otevře novou místnost se sdíleným videem.

## 🛠️ Technologie

- **Javascript (ES6+)**: Logika na pozadí a interakce v popupu.
- **CSS3**: Vlastní design s využitím CSS proměnných a moderních efektů (glassmorphism, gradients).
- **Chrome Extension API**: `tabs`, `storage`, `background scripts`.

## 📜 Autor

Vytvořil **Vagis** pro komunitu hellspy.to

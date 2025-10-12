import { useState } from "react";
import logoImg from "../assets/logo-no-bg.png";

export default function Footer() {
  const year = new Date().getFullYear();
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  return (
    <footer className="border-t border-white/20 mt-10">
      <div className="container-max px-4">
        <div
          className="flex flex-col items-center justify-between text-center gap-6 py-6
                     md:flex-row md:text-left"
        >
          {/* SINISTRA - Logo + Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={logoImg}
              alt="logo"
              className="w-8 sm:w-9 md:w-10 h-auto rounded-full"
            />
            <span className="text-white/80 font-medium">Nikelino Shop</span>
          </div>

          {/* CENTRO - Bannerini Privacy + Terms */}
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setOpenPrivacy(true)}
              className="px-3 py-1 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white/90 transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setOpenTerms(true)}
              className="px-3 py-1 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white/90 transition"
            >
              Termini & Condizioni
            </button>
          </div>

          {/* DESTRA - Crediti */}
          <div className="text-white/80 text-sm md:text-base text-center md:text-right">
            <span className="leading-snug break-words">
              © {year} Developed with <span className="text-red-400">❤</span> by{" "}
              <span className="font-semibold">MadGiiRL</span>
            </span>
          </div>
        </div>
      </div>

      {/* MODALE PRIVACY */}
      {openPrivacy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0e1830] text-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setOpenPrivacy(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
            <div className="text-sm leading-relaxed space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <p>
                Benvenuto su <strong>Nikelino Shop</strong>. Noi – MaDGiiRL,
                Nikelino e Ale – ci impegniamo a proteggere la tua
                privacy e i tuoi dati personali. In questa policy spieghiamo
                quali dati raccogliamo, come li usiamo e quali sono i tuoi
                diritti.
              </p>
              <p>
                <strong>Dati che raccogliamo:</strong> username, email, Discord
                ID, informazioni di profilo (es. avatar, preferenze) e dati
                tecnici come IP o log di accesso.
              </p>
              <p>
                <strong>Finalità:</strong> autenticazione, gestione del profilo,
                completamento acquisti, comunicazioni tramite Discord, analisi e
                prevenzione frodi.
              </p>
              <p>
                <strong>Base legale:</strong> consenso, contratto (erogazione
                del servizio), obblighi di legge. Rispettiamo le normative GDPR.
              </p>
              <p>
                <strong>Conservazione:</strong> manteniamo i dati finché hai un
                account attivo o per il tempo necessario a fini legali e di
                supporto.
              </p>
              <p>
                <strong>Condivisione:</strong> non vendiamo i tuoi dati.
                Condividiamo solo con servizi tecnici (hosting, Discord) o
                autorità legali se richiesto.
              </p>
              <p>
                <strong>Sicurezza:</strong> usiamo misure tecniche e
                organizzative (protocolli sicuri, crittografia, accessi
                protetti).
              </p>
              <p>
                <strong>Diritti:</strong> accedere, modificare, cancellare i
                dati, opporsi, richiedere portabilità o revocare il consenso.
              </p>
              <p>
                <strong>Cookie:</strong> il sito può usare cookie tecnici e di
                analisi, gestibili dalle impostazioni del browser.
              </p>
              <p>
                <strong>Modifiche:</strong> potremmo aggiornare la policy.
                Versione aggiornata disponibile sul sito con data ultima
                modifica.
              </p>
              <p>
                <strong>Contatti:</strong> per domande o richieste usa il
                supporto ufficiale o i canali Discord.
              </p>
              <p className="font-medium">Ultimo aggiornamento: {year}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALE TERMINI */}
      {openTerms && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0e1830] text-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setOpenTerms(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Termini & Condizioni</h2>
            <div className="text-sm leading-relaxed space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <p>
                Utilizzando <strong>Nikelino Shop</strong> accetti i seguenti
                Termini & Condizioni. Se non sei d&apos;accordo, non utilizzare
                il sito o i nostri servizi.
              </p>
              <p>
                <strong>Prodotti:</strong> offriamo risorse digitali (tattoo,
                occhi custom, grafiche, intro, loghi, settaggi streaming, video
                editing). La consegna avviene tramite Discord o canali digitali
                ufficiali.
              </p>
              <p>
                <strong>Account:</strong> sei responsabile della correttezza dei
                dati forniti, della password e di ogni attività svolta con il
                tuo account.
              </p>
              <p>
                <strong>Acquisti:</strong> avvengono tramite Discord. Dopo il
                pagamento riceverai le istruzioni e i file digitali.
              </p>
              <p>
                <strong>Consegna:</strong> immediata o nei tempi concordati.
                Controlla subito i file ricevuti e segnala eventuali problemi.
              </p>
              <p>
                <strong>Rimborsi:</strong> non previsti per contenuti digitali
                già consegnati, salvo eccezioni (errori tecnici, file
                difettosi).
              </p>
              <p>
                <strong>Proprietà intellettuale:</strong> i materiali sono
                protetti da copyright. È vietata la rivendita o distribuzione
                senza consenso.
              </p>
              <p>
                <strong>Uso consentito:</strong> solo personale o
                professionale/streaming, se previsto. Sei responsabile della
                conformità con le regole di FiveM, Twitch, YouTube ecc.
              </p>
              <p>
                <strong>Limitazioni:</strong> non siamo responsabili per danni
                indiretti, malfunzionamenti hardware/software, o uso improprio
                dei prodotti.
              </p>
              <p>
                <strong>Modifiche:</strong> i Termini possono essere aggiornati
                e saranno pubblicati sul sito con data di revisione.
              </p>
              <p>
                <strong>Legge applicabile:</strong> regolati dalla legge
                italiana ed europea. Foro competente: quello del luogo di sede
                di Nikelino Shop.
              </p>
              <p>
                <strong>Contatti:</strong> per dubbi o richieste utilizza i
                nostri canali ufficiali sul sito o Discord.
              </p>
              <p className="font-medium">Ultimo aggiornamento: {year}</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

import { contact, person } from "@/lib/content";
import Reveal from "./Reveal";
import ConsentSettings from "./ConsentSettings";
import styles from "./Contact.module.css";

const channels = [
  { label: "Email", value: person.email, href: `mailto:${person.email}` },
  { label: "GitHub", value: "github.com/apjake", href: person.github },
  { label: "LinkedIn", value: "linkedin.com/in/apjake", href: person.linkedin },
  { label: "Telegram", value: "@AP_Jake", href: person.telegram },
];

export default function Contact() {
  return (
    <footer id="contact" className={styles.section} aria-labelledby="contact-heading" data-track-section="contact">
      <div className={styles.glow} aria-hidden="true" />

      <div className={`shell ${styles.inner}`}>
        <Reveal>
          <h2 id="contact-heading" className={styles.headline}>
            {contact.headline.map((line, i) => (
              <span key={line} className={styles.line}>
                {i === contact.headline.length - 1 ? (
                  <>
                    {line.slice(0, -1)}
                    <span className={styles.dot}>.</span>
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <p className={styles.note}>{contact.note}</p>
        </Reveal>

        <Reveal delay={160}>
          <ul className={styles.channels}>
            {channels.map((c) => (
              <li key={c.label} className={styles.channel}>
                <span className={`monoLabel ${styles.channelLabel}`}>{c.label}</span>
                <a
                  className={styles.channelLink}
                  href={c.href}
                  data-track="contact_click"
                  data-track-channel={c.label.toLowerCase()}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className={styles.colophon}>
          <hr className="rule" />
          <div className={styles.colophonRow}>
            <span className={styles.wordmark}>{person.wordmark}</span>
            <span className={`monoLabel ${styles.colophonMeta}`}>
              {person.name} · {person.location}
            </span>
            <ConsentSettings />
          </div>
        </div>
      </div>
    </footer>
  );
}

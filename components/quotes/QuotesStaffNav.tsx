import Link from "next/link";
import { site } from "@/lib/site";

type Props = {
  current: "quotes" | "projects";
  crumb?: string;
};

export function QuotesStaffNav({ current, crumb }: Props) {
  return (
    <header className="quotes-nav">
      <p>
        <Link href="/quotes">{site.legalName}</Link>
        {crumb ? (
          <>
            {" / "}
            {crumb}
          </>
        ) : null}
      </p>
      <div className="quotes-nav-actions">
        <nav className="quotes-staff-links" aria-label="Staff sections">
          <Link
            href="/quotes"
            className={current === "quotes" ? "is-active" : undefined}
          >
            Quotes
          </Link>
          <Link
            href="/quotes/projects"
            className={current === "projects" ? "is-active" : undefined}
          >
            Projects
          </Link>
        </nav>
        <form action="/api/quotes/logout" method="post">
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

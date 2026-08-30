export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-inner">
        <a className="brand" href="#top" aria-label="Arjovi Solutions home">
          <img
            className="brand-logo logo-light"
            src="/assets/brand/logo-horizontal.png"
            alt=""
            width={1024}
            height={378}
          />
          <img
            className="brand-logo logo-dark"
            src="/assets/brand/logo-dark.png"
            alt=""
            width={1494}
            height={589}
          />
        </a>
        <p>© {year} Arjovi Solutions. Otsego, MN.</p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}

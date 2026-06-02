import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <h1>Page not found</h1>
        <p>The requested Essential Eight reference page could not be found.</p>
        <Link className="text-link" to="/">
          Return to the overview
        </Link>
      </section>
    </div>
  );
}


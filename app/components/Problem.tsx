export default function Problem() {
    return (
      <section className="p-8">
        <h2 className="text-3xl font-bold mb-4 text-center">The Deepfake Threat</h2>
        <p className="mb-4">
          By 2025, an estimated 8 million deepfakes will flood online platforms, with over 90% used for malicious purposes like non-consensual pornography, financial fraud, and misinformation.
        </p>
        <p className="text-sm text-gray-400">
          Sources:{' '}
          <a href="https://www.security.org/resources/deepfake-statistics/" className="text-blue-400 hover:underline">
            Security.org
          </a>
          ,{' '}
          <a href="https://www.spiralytics.com/blog/deepfake-statistics/" className="text-blue-400 hover:underline">
            Spiralytics
          </a>
        </p>
      </section>
    );
  }
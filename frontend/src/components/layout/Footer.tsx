import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Resume Builder</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              AI-powered resume builder with ATS optimization. Create professional resumes that get you hired.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-gray-900 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-gray-600 hover:text-gray-900 text-sm">
                  All Templates
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 text-sm">
                  Career Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resume Templates</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resume/software-engineer" className="text-gray-600 hover:text-gray-900 text-sm">
                  Software Engineer
                </Link>
              </li>
              <li>
                <Link href="/resume/data-analyst" className="text-gray-600 hover:text-gray-900 text-sm">
                  Data Analyst
                </Link>
              </li>
              <li>
                <Link href="/resume/java-developer" className="text-gray-600 hover:text-gray-900 text-sm">
                  Java Developer
                </Link>
              </li>
              <li>
                <Link href="/resume/mba-fresher" className="text-gray-600 hover:text-gray-900 text-sm">
                  MBA Fresher
                </Link>
              </li>
              <li>
                <Link href="/resume/company/tcs" className="text-gray-600 hover:text-gray-900 text-sm">
                  Resume for TCS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-gray-900 text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Resume Builder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

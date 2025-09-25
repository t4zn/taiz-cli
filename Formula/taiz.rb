class Taiz < Formula
  desc "A polyglot package manager for developers"
  homepage "https://github.com/t4zn/taiz-cli"
  url "https://github.com/t4zn/taiz-cli/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "YOUR_SHA256_HASH_HERE"
  license "MIT"
  head "https://github.com/t4zn/taiz-cli.git", branch: "main"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/taiz", "--version"
    system "#{bin}/taiz", "--help"
  end
end
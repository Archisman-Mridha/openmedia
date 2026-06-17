{
  stdenv,
  fetchurl,
  system,
}:
let
  version = "0.3.0";
  sources = {
    "aarch64-darwin" = {
      arch = "aarch64-apple-darwin";
      hash = "sha256-1Q+1iBEOzCdDJZ5JadQXyPDN0iwl5MYcnIsF2tNVDs0=";
    };
    "aarch64-linux" = {
      arch = "aarch64-unknown-linux-musl";
      hash = "sha256-cOJGCu6mVISNCdS7aicqvREOYa/s4Jcdla71o3tOY24=";
    };
    "x86_64-linux" = {
      arch = "x86_64-unknown-linux-musl";
      hash = "sha256-wWzRSHU8XG2r1lCZgAeeGtrKlrxMmCAHREGJ1BVBlQs=";
    };
  };
  source = sources.${system};
in
stdenv.mkDerivation {
  pname = "protoc-gen-grafbase-subgraph";
  inherit version;
  src = fetchurl {
    url = "https://github.com/grafbase/extensions/releases/download/protoc-gen-grafbase-subgraph-v${version}/protoc-gen-grafbase-subgraph-${source.arch}";
    hash = source.hash;
  };
  dontUnpack = true;
  installPhase = ''
    mkdir -p $out/bin
    cp $src $out/bin/protoc-gen-grafbase-subgraph
    chmod +x $out/bin/protoc-gen-grafbase-subgraph
  '';
}

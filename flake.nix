{
  description = "OpenMedia development environment";

  inputs = {
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    systems.url = "github:nix-systems/default";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    {
      self,
      nixpkgs,
      systems,
      devenv,
      ...
    }@inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      devShells = forEachSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config.allowUnfree = true;
          };
        in
        {
          default = devenv.lib.mkShell {
            inherit inputs pkgs;
            modules = [
              {
                # Most packages come pre-built with binaries provided by the official Nix binary
                # cache.
                # If you're modifying a package or using a package that's not built upstream, Nix
                # will build it from source instead of downloading a binary.
                # To prevent packages from being built more than once, devenv provides seamless
                # integration with binary caches hosted by Cachix.
                cachix.enable = true;

                packages = with pkgs; [
                  bun

                  k3d
                  terraform
                  terragrunt
                  kops
                  tanka
                  go-jsonnet
                  jsonnet-bundler
                  kubeseal
                  karmor

                  tflint
                  hadolint
                  yamlfmt
                  statix

                  prek
                ];

                env = {
                  KOPS_STATE_STORE = "s3://kops-state-store.openmedia";
                };

                enterShell = ''
                  export KUBECONFIG="$(pwd)/infrastructure/kubernetes/kubeconfig.yaml"

                  prek install
                '';
              }
            ];
          };
        }
      );
    };
}

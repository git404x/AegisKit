{
  description = "Aegis Toolkit Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in
  {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        nodejs_22
        nodePackages.pnpm
      ];

      shellHook = ''
        echo "🚀 Toolkit Dev Environment Active!"
        echo "Node version: $(node -v)"
        echo "pnpm version: $(pnpm -v)"
      '';
    };
  };
}

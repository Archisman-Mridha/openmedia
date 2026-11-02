package cmd

import (
	"context"
	"os"

	"github.com/samber/oops"
	"openmedia.io/clusterman/pkg/datadir"
)

const ENVNameKUBECONFIG = "KUBECONFIG"

func Run(ctx context.Context) error {
	// Set the KUBECONFIG environment variable to the clusterman managed kubeconfig file.
	kubeconfigFilePath, err := datadir.KubeconfigFilePath()
	if err != nil {
		return oops.Wrapf(err, "Failed getting kubeconfig file path")
	}
	os.Setenv(ENVNameKUBECONFIG, *kubeconfigFilePath)

	return nil
}

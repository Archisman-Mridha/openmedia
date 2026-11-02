package datadir

import (
	"os"
	"path"

	"github.com/samber/oops"
)

const kubeconfigFileName = "kubeconfig.yaml"

var cachedClusterManDataDirPath *string

// Returns the path to the directory where clusterman stores all its data.
func Path() (*string, error) {
	// When we have cached the data directory path, use that.
	if cachedClusterManDataDirPath != nil {
		return cachedClusterManDataDirPath, nil
	}

	// Get path to the user's home directory.
	homeDirPath, err := os.UserHomeDir()
	if err != nil {
		return nil, oops.Wrapf(err, "Failed getting home directory path")
	}

	clusterManDataDirPath := path.Join(homeDirPath, ".openmedia/clusterman")

	// Cache the path.
	cachedClusterManDataDirPath = &clusterManDataDirPath

	return new(clusterManDataDirPath), nil
}

// Returns the path to the kubeconfig file, where all clusters' kubeconfigs are stored.
func KubeconfigFilePath() (*string, error) {
	// Get the path to the  directory where clusterman stores all its data.
	clusterManDataDirPath, err := Path()
	if err != nil {
		return nil, oops.Wrapf(err, "Failed getting clusterman's data directory path")
	}

	kubeconfigFilePath := path.Join(*clusterManDataDirPath, kubeconfigFileName)
	return new(kubeconfigFilePath), nil
}

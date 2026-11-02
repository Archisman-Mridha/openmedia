package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"openmedia.io/clusterman/pkg/cmd"
)

func main() {
	ctx := context.Background()

	err := cmd.Run(ctx)
	if err != nil {
		slog.Error(fmt.Sprintf("%v", err))
		os.Exit(1)
	}
}

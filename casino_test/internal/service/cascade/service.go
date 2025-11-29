package cascade

import (
	"casino_test/internal/config"
	"casino_test/internal/repository"
	"casino_test/internal/service"
)

type serv struct {
	cfg  config.CascadeConfig
	repo repository.CascadeRepository
}

// NewCascade Создать новый cascade
func NewCascadeService(cfg config.CascadeConfig, repo repository.CascadeRepository) service.CascadeService {
	return &serv{
		cfg:  cfg,
		repo: repo,
	}
}

package line

import (
	"casino_test/internal/config"
	"casino_test/internal/repository"
	"casino_test/internal/service"
)

type serv struct {
	cfg  config.LineConfig
	repo repository.LineRepository
}

// NewLine Создать новый слот 5x3
func NewLineService(cfg config.LineConfig, repo repository.LineRepository) service.LineService {
	return &serv{
		cfg:  cfg,
		repo: repo,
	}
}

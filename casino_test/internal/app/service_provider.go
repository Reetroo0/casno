package app

import (
	"casino_test/internal/api"
	"casino_test/internal/config"
	"casino_test/internal/config/env"
	"casino_test/internal/repository"
	"casino_test/internal/repository/cascadeRepo"
	"casino_test/internal/repository/lineRepo"
	"casino_test/internal/service"
	"casino_test/internal/service/cascade"
	"casino_test/internal/service/line"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

type ServiceProvider struct {
	lineCfg    config.LineConfig
	repository repository.LineRepository
	service    service.LineService
	handler    *api.Handler
	// Cascade bits
	cascadeCfg  config.CascadeConfig
	cascadeRepo repository.CascadeRepository
	cascadeServ service.CascadeService
	cascadeHand *api.CascadeHandler
	router      chi.Router
}

func newServiceProvider() *ServiceProvider {
	return &ServiceProvider{}
}

func (sp *ServiceProvider) LineCfg() config.LineConfig {
	if sp.lineCfg == nil {
		cfg, err := env.NewLineConfigFromYAML("config.yaml")
		if err != nil {
			panic("failed to get line config: " + err.Error())
		}

		sp.lineCfg = cfg
	}

	return sp.lineCfg
}

func (sp *ServiceProvider) Repository() repository.LineRepository {
	if sp.repository == nil {
		sp.repository = lineRepo.NewLineRepository()
	}
	return sp.repository
}

func (sp *ServiceProvider) Service() service.LineService {
	if sp.service == nil {
		sp.service = line.NewLineService(sp.LineCfg(), sp.Repository())
	}

	return sp.service
}

func (sp *ServiceProvider) CascadeCfg() config.CascadeConfig {
	if sp.cascadeCfg == nil {
		cfg, err := env.NewCascadeConfigFromYAML("config.yaml")
		if err != nil {
			panic("failed to get cascade config: " + err.Error())
		}
		sp.cascadeCfg = cfg
	}
	return sp.cascadeCfg
}

func (sp *ServiceProvider) CascadeRepository() repository.CascadeRepository {
	if sp.cascadeRepo == nil {
		sp.cascadeRepo = cascadeRepo.NewCascadeRepository()
	}
	return sp.cascadeRepo
}

func (sp *ServiceProvider) CascadeService() service.CascadeService {
	if sp.cascadeServ == nil {
		sp.cascadeServ = cascade.NewCascadeService(sp.CascadeCfg(), sp.CascadeRepository())
	}
	return sp.cascadeServ
}

func (sp *ServiceProvider) CascadeHandler() *api.CascadeHandler {
	if sp.cascadeHand == nil {
		sp.cascadeHand = api.NewCascadeHandler(api.CascadeHandlerDependencies{Serv: sp.CascadeService()})
	}
	return sp.cascadeHand
}

func (sp *ServiceProvider) Handler() *api.Handler {
	if sp.handler == nil {
		sp.handler = api.NewHandler(api.HandlerDependencies{
			Serv: sp.Service(),
		})
	}

	return sp.handler
}

func (sp *ServiceProvider) Router() chi.Router {
	if sp.router == nil {
		r := chi.NewRouter()

		r.Use(cors.Handler(cors.Options{
			// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
			AllowedOrigins: []string{"https://*", "http://*"},
			// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: false,
			MaxAge:           300, // Maximum value not ignored by any of major browsers
		}))

		h := sp.Handler()
		// Регистрируем маршрут /spin
		r.Post("/spin", h.Spin)
		// Регистрируем маршрут для покупки бонуса
		r.Post("/buy-bonus", h.BuyBonus)
		// Регистрируем маршрут для депозита
		r.Post("/deposit", h.Deposit)
		// Регистрируем маршрут для проверки данных пользователя
		r.Get("/check-data", h.CheckData)

		// Cascade endpoints
		ch := sp.CascadeHandler()
		r.Route("/cascade", func(rr chi.Router) {
			rr.Post("/spin", ch.Spin)
			rr.Post("/buy-bonus", ch.BuyBonus)
			rr.Post("/deposit", ch.Deposit)
			rr.Get("/check-data", ch.CheckData)
		})

		sp.router = r
	}

	return sp.router
}

package app

import "net/http"

type App struct {
	ServiceProvider *ServiceProvider
}

func NewApp() *App {
	return &App{}
}

func (s *App) initServiceProvider() {
	s.ServiceProvider = newServiceProvider()
	// Регистрируем обработчики и маршруты на роутере
	_ = s.ServiceProvider.Handler()
}

func (s *App) Run() error {
	s.initServiceProvider()

	r := s.ServiceProvider.Router()

	err := http.ListenAndServe(":8080", r)
	if err != nil {
		return err
	}
	return err
}

package main

import "casino_test/internal/app"

func main() {
	a := app.NewApp()
	err := a.Run()
	if err != nil {
		return
	}
}

package main

import (
	"casino_test/internal/app"
	"log"
)

func main() {
	a := app.NewApp()
	err := a.Run()
	if err != nil {
		log.Fatal(err)
	}
}

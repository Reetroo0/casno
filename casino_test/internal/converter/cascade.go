package converter

import (
	"casino_test/internal/api/dto"
	"casino_test/internal/model"
)

func ToCascadeSpin(req dto.CascadeSpinRequest) model.CascadeSpin {
	return model.CascadeSpin{
		Bet: req.Bet,
	}
}

// Основной конвертер результата спина
func ToCascadeSpinResponse(resp model.CascadeSpinResult) dto.CascadeSpinResponse {
	return dto.CascadeSpinResponse{
		Board:            resp.Board,
		Cascades:         toCascadeSteps(resp.Cascades),
		TotalPayout:      resp.TotalPayout,
		Balance:          resp.Balance,
		ScatterCount:     resp.ScatterCount,
		AwardedFreeSpins: resp.AwardedFreeSpins,
		FreeSpinsLeft:    resp.FreeSpinsLeft,
		InFreeSpin:       resp.InFreeSpin,
	}
}

// Вспомогательные конвертеры
func toCascadeSteps(steps []model.CascadeStep) []dto.CascadeStep {
	result := make([]dto.CascadeStep, len(steps))
	for i, step := range steps {
		result[i] = dto.CascadeStep{
			CascadeIndex: step.CascadeIndex,
			Clusters:     toClusterInfos(step.Clusters),
			NewSymbols:   toNewSymbols(step.NewSymbols),
		}
	}
	return result
}

func toClusterInfos(clusters []model.ClusterInfo) []dto.ClusterInfo {
	result := make([]dto.ClusterInfo, len(clusters))
	for i, cl := range clusters {
		result[i] = dto.ClusterInfo{
			Symbol:     cl.Symbol,
			Cells:      toPositions(cl.Cells),
			Count:      cl.Count,
			Payout:     cl.Payout,
			Multiplier: cl.Multiplier,
		}
	}
	return result
}

func toPositions(positions []model.Position) []dto.Position {
	result := make([]dto.Position, len(positions))
	for i, p := range positions {
		result[i] = dto.Position{
			Row: p.Row,
			Col: p.Col,
		}
	}
	return result
}

func toNewSymbols(newSyms []struct {
	model.Position
	Symbol int
}) []dto.NewSymbol {
	result := make([]dto.NewSymbol, len(newSyms))
	for i, ns := range newSyms {
		result[i] = dto.NewSymbol{
			Position: dto.Position{
				Row: ns.Row,
				Col: ns.Col,
			},
			Symbol: ns.Symbol,
		}
	}
	return result
}

// Общий ответ с балансом и фриспинами
func ToCascadeDataResponse(data model.CascadeData) dto.CascadeDataResponse {
	return dto.CascadeDataResponse{
		Balance:       data.Balance,
		FreeSpinsLeft: data.FreeSpinCount,
	}
}

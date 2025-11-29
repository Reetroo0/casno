package converter

import (
	"casino_test/internal/api/dto"
	"casino_test/internal/model"
)

func ToLineSpin(req dto.LineSpinRequest) model.LineSpin {
	return model.LineSpin{
		Bet: req.Bet,
	}
}

func ToLineSpinResponse(resp model.SpinResult) dto.LineSpinResponse {
	return dto.LineSpinResponse{
		Board:            resp.Board,
		LineWins:         toLineWins(resp.LineWins),
		ScatterCount:     resp.ScatterCount,
		ScatterPayout:    resp.ScatterPayout,
		AwardedFreeSpins: resp.AwardedFreeSpins,
		TotalPayout:      resp.TotalPayout,
		Balance:          resp.Balance,
		FreeSpinCount:    resp.FreeSpinCount,
		InFreeSpin:       resp.InFreeSpin,
	}
}

func toLineWins(lineWins []model.LineWin) []dto.LineWin {
	result := make([]dto.LineWin, len(lineWins))
	for i, line := range lineWins {
		result[i] = dto.LineWin{
			Line:   line.Line,
			Symbol: line.Symbol,
			Count:  line.Count,
			Payout: line.Payout,
		}
	}
	return result
}

func ToDataResponse(data model.Data) dto.DataResponse {
	return dto.DataResponse{
		Balance:       data.Balance,
		FreeSpinCount: data.FreeSpinCount,
	}
}

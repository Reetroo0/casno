package api

import (
	"casino_test/internal/api/dto"
	"casino_test/internal/converter"
	"casino_test/internal/service"
	"casino_test/pkg/req"
	"casino_test/pkg/resp"
	"net/http"
)

type HandlerDependencies struct {
	Serv service.LineService
}

type Handler struct {
	serv service.LineService
}

func NewHandler(deps HandlerDependencies) *Handler {
	return &Handler{serv: deps.Serv}
}

func (h *Handler) Spin(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.LineSpinRequest](r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.serv.Spin(r.Context(), converter.ToLineSpin(payload))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := converter.ToLineSpinResponse(*result)

	resp.WriteJSONResponse(w, http.StatusOK, response)
}

func (h *Handler) BuyBonus(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.BuyBonusRequest](r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.serv.BuyBonus(payload.Amount); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp.WriteJSONResponse(w, http.StatusOK, map[string]string{"result": "ok"})
}

func (h *Handler) Deposit(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.DepositRequest](r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.serv.Deposit(payload.Amount); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp.WriteJSONResponse(w, http.StatusOK, map[string]string{"result": "ok"})
}

func (h *Handler) CheckData(w http.ResponseWriter, r *http.Request) {
	data, err := h.serv.CheckData()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := converter.ToDataResponse(*data)
	resp.WriteJSONResponse(w, http.StatusOK, response)
}

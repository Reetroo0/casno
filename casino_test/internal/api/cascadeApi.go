package api

import (
	"casino_test/internal/api/dto"
	"casino_test/internal/converter"
	"casino_test/internal/service"
	"casino_test/pkg/req"
	"casino_test/pkg/resp"
	"net/http"
)

type CascadeHandlerDependencies struct {
	Serv service.CascadeService
}

type CascadeHandler struct {
	serv service.CascadeService
}

func NewCascadeHandler(deps CascadeHandlerDependencies) *CascadeHandler {
	return &CascadeHandler{serv: deps.Serv}
}

func (h *CascadeHandler) Spin(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.CascadeSpinRequest](r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.serv.Spin(r.Context(), converter.ToCascadeSpin(payload))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := converter.ToCascadeSpinResponse(*result)
	resp.WriteJSONResponse(w, http.StatusOK, response)
}

func (h *CascadeHandler) BuyBonus(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.BuyCascadeBonusRequest](r.Body)
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

func (h *CascadeHandler) Deposit(w http.ResponseWriter, r *http.Request) {
	payload, err := req.Decode[dto.BuyCascadeBonusRequest](r.Body)
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

func (h *CascadeHandler) CheckData(w http.ResponseWriter, r *http.Request) {
	data, err := h.serv.CheckData()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := converter.ToCascadeDataResponse(*data)
	resp.WriteJSONResponse(w, http.StatusOK, response)
}

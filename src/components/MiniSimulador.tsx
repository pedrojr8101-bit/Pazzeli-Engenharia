<input
        id="valor-conta"
        type="range"
        min={200}
        max={20000}
        step={10}
        value={valorConta}
        onChange={(e) => setValorConta(Number(e.target.value))}
        className="mt-3 w-full accent-sun"
        aria-label="Valor médio da conta de luz em reais"
      />
      <div className="flex justify-between text-xs text-graphite/40">
        <span>R$ 200</span>
        <span>R$ 20.000</span>
      </div>
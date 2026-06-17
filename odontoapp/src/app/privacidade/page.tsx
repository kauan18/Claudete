export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 py-16 px-6">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm mb-8">Última atualização: junho de 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Dados coletados</h2>
          <p className="text-gray-600">Coletamos os seguintes dados pessoais para fins de agendamento de consultas:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Nome completo</li>
            <li>Número de telefone / WhatsApp</li>
            <li>Endereço de e-mail (opcional)</li>
            <li>Informações sobre o serviço e horário desejado</li>
            <li>Observações fornecidas voluntariamente</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Finalidade do tratamento</h2>
          <p className="text-gray-600">Os dados coletados são utilizados exclusivamente para:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Confirmação e gestão dos agendamentos</li>
            <li>Envio de lembretes e comunicados sobre a consulta</li>
            <li>Contato em caso de necessidade de reagendamento ou cancelamento</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Base legal (LGPD)</h2>
          <p className="text-gray-600">
            O tratamento dos dados é fundamentado no consentimento do titular (art. 7º, I da Lei nº 13.709/2018)
            e na execução de contrato de prestação de serviços de saúde (art. 7º, V).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Compartilhamento</h2>
          <p className="text-gray-600">
            Seus dados não são comercializados ou compartilhados com terceiros, exceto com prestadores de
            infraestrutura (servidores, banco de dados) que operam sob acordo de confidencialidade, e quando
            exigido por lei.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Retenção e exclusão</h2>
          <p className="text-gray-600">
            Os dados são armazenados pelo período necessário para a prestação dos serviços e cumprimento de
            obrigações legais. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo e-mail da clínica.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Seus direitos</h2>
          <p className="text-gray-600">Você tem direito a:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Acessar os dados que temos sobre você</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
            <li>Reclamar à Autoridade Nacional de Proteção de Dados (ANPD)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contato</h2>
          <p className="text-gray-600">
            Para exercer seus direitos ou esclarecer dúvidas, entre em contato com a clínica responsável
            pelo agendamento que você realizou.
          </p>
        </section>
      </div>
    </div>
  );
}

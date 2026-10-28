# Operação comercial da REALBUX

O vendedor confirmou os 121 produtos e possui o estoque. Os 32 itens que custavam menos de R$ 5,00 passaram a R$ 6,00 no site e na Velani. Os demais preços foram preservados. Há 120 produtos disponíveis e um sem estoque.

## Pagamento único do carrinho

O cliente entra na conta, confere produtos, quantidades e e-mail, aceita os termos e gera um único Pix pela API Velani. O servidor ignora preços enviados pelo navegador, consulta o catálogo, valida estoque e soma valores inteiros em centavos. O total deve ficar entre R$ 5,00 e R$ 3.000,00, conforme o contrato da Velani.

A chave VELANI_SECRET_KEY fica apenas no servidor da Vercel. O token temporário do painel não é usado pelo site. O Pix é mostrado com QR Code local e copia e cola; imagens externas de QR Code não são carregadas.

Pedidos e referências de pagamento são persistidos no Turso. Requisições repetidas do mesmo carrinho reutilizam o pedido e a chave de idempotência. Uma falha de rede não é tratada como pagamento recusado nem cria automaticamente outra cobrança.

O pagamento só muda para confirmado após consulta autenticada à API Velani, com conferência do ID da transação, referência e valor. O cliente não pode marcar o pedido como pago. A consulta acontece na tela do Pix e pode ser acionada por Verificar pagamento. O carrinho só remove os itens desse pedido após confirmação.

Os 121 links individuais continuam cadastrados na Velani para compatibilidade; compras por esses links não são sincronizadas ao histórico local. O fluxo principal do site usa a API para cobrar o carrinho inteiro.

## Entrega manual

O vendedor envia manualmente todos os itens e quantidades do pedido ao e-mail da conta do comprador após conferir o pagamento no painel da Velani. A mensagem automática dos links individuais não substitui esse envio.

O nome, e-mail, lista de itens, quantidades e total são enviados à Velani junto da cobrança. A entrega não exige senha Roblox nos formulários da loja. Não há envio automático de credenciais ou produtos.

## Histórico e limites

Pedidos novos aparecem em Minha conta → Meus pedidos. Pagamentos pendentes podem ser retomados pelo botão Ver Pix e verificar pagamento. O estado é atualizado por consulta à API, sem depender de informações enviadas pelo navegador.

Não há webhook, reserva global de estoque ou entrega automática. O vendedor deve conferir o painel da Velani antes de entregar, mesmo quando o comprador não estiver mais com o site aberto. Registros antigos de demonstração são preservados no banco e omitidos da resposta pública.

## Credenciais e validação

Configure VELANI_SECRET_KEY como segredo na hospedagem. Não coloque chaves no frontend ou no Git. Testes automatizados simulam a Velani e verificam preços, quantidades, tentativas concorrentes, resposta perdida, confirmação, isolamento entre usuários e manutenção do carrinho.

Uma cobrança real de verificação pode ser gerada sem pagamento para conferir a integração publicada. Uma cobrança pendente não significa dinheiro recebido.

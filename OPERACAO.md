# Operação comercial da REALBUX

O usuário confirmou os 121 produtos, as quantidades e os preços com 75% OFF. A interface não contém avisos de demonstração, avaliações copiadas ou contadores de clientes não comprovados.

A condição de entrega fornecida pelo usuário está em `public/store-policy.js`: entrega imediata no e-mail cadastrado após a confirmação do pagamento. Ela aparece na descrição dos 121 produtos, nas abas de informações, no FAQ e nos termos. O texto é a condição comercial; o envio automático ainda não foi implementado.

## Estado atual

Catálogo, carrinho, cadastro e login funcionam no código. O provedor de pagamento ainda não foi definido. Não há credenciais de pagamento ou envio de e-mails configuradas neste ambiente.

O checkout mostra “Pagamento indisponível no momento”. Para uma sessão autenticada, `POST /api/orders` retorna HTTP 503 com `CHECKOUT_UNAVAILABLE`, sem criar pedido ou cobrança fictícia. Não existe uma variável que transforme registros de teste em pagamentos reais.

Registros antigos com status `demo` são preservados no banco, mas não são retornados no histórico público. Nenhum registro foi convertido em compra real ou apagado. Pedidos reais usam estados `pending_payment`, `paid`, `fulfilled`, `cancelled` e `refunded`; a integração que produz essas transições ainda não está pronta.

## Ativação das vendas

Após escolher o provedor, integrar cobrança e confirmação por webhook verificado, com preços e estoque validados no servidor. Configurar banco persistente e serviço de e-mail para entregar o conteúdo ou as instruções somente após confirmar o pagamento, com prevenção de duplicidade, tratamento de falhas e registro da entrega.

O responsável deve completar a identificação comercial e o canal de atendimento e revisar os termos e a política de privacidade antes de abrir as vendas. Credenciais devem ser inseridas nas configurações seguras da hospedagem, nunca no código ou no chat. Não basta remover o aviso de indisponibilidade para ativar as compras.

## Compatibilidade

Os slugs novos não usam `demo-`. Links antigos são normalizados e itens do carrinho existente são migrados para os IDs correspondentes. Os registros históricos permanecem intactos.

import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;
import ghidra.program.model.pcode.PcodeOp;
import ghidra.program.model.address.AddressSetView;
import com.google.gson.Gson;
import java.util.*;
import ghidra.program.model.address.Address;


public class FunctionReferences extends GhidraScript {

    @Override
    public void run() throws Exception {
        Map<String, List<String>> functionCalls = new HashMap<>();
        FunctionIterator functions = currentProgram.getFunctionManager().getFunctions(true);

        for (Function function : functions) {
            List<String> calls = new ArrayList<>();
            AddressSetView body = function.getBody();
            InstructionIterator instIter = currentProgram.getListing().getInstructions(body, true);

            while (instIter.hasNext()) {
                Instruction inst = instIter.next();
                for (PcodeOp pcode : inst.getPcode()) {
                    if (pcode.getOpcode() == PcodeOp.CALL) {
                        Address target = pcode.getInput(0).getAddress();
                        Function calledFunction = getFunctionAt(target);
                        if (calledFunction != null) {
                            calls.add(calledFunction.getName());
                        }
                    }
                }
            }

            if (!calls.isEmpty()) {
                functionCalls.put(function.getName(), calls);
            }
        }

        Gson gson = new Gson();
        String jsonOutput = gson.toJson(functionCalls);
        System.out.println("ReferenceOutput: " + jsonOutput);
    }
}
